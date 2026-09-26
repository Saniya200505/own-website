"""
Builds assets/butterfly.glb (and the base64 copy used on file://) out of
butterfly.zip, the asset pack as downloaded.

The source (source/b6666666666.glb, 8.5 MB) is a static Microsoft-exporter scene:
a body mesh plus two alpha-cut wing planes, buried under six levels of nested
nodes with non-uniform scales, no animation, and 8.4 MB of textures - including
a 4 MB KHR_materials_pbrSpecularGlossiness map that three.js r147 cannot read.

This flattens it into something a page can animate:

  * every node transform baked into world space, then rotated into a canonical
    frame - +X = wingspan, +Y = the way she flies, +Z = up off her back -
    centred on the body and scaled so the wingspan is exactly 1 unit
  * each wing re-parented to a hinge node on the body midline, so a single
    rotation.y on that node flaps it
  * body texture cropped to the 21% of the atlas its UVs actually use (with the
    UVs remapped to match), spec-gloss dropped, flat metal/rough maps replaced
    by factors

Result: ~0.3 MB, three nodes, no nesting.

Run:  python build-butterfly.py
"""
import struct, json, io, base64, os, zipfile
import numpy as np
from PIL import Image

ZIP, INNER = 'butterfly.zip', 'source/b6666666666.glb'
DST, B64 = 'assets/butterfly.glb', 'assets/butterfly-model.js'
BODY_TEX_W = 256                       # body atlas crop, px wide

# ------------------------------------------------------------ read the source
with zipfile.ZipFile(ZIP) as z:
    raw = z.read(INNER)
pos = 12
clen, _ = struct.unpack_from('<II', raw, pos); pos += 8
J = json.loads(raw[pos:pos+clen].decode('utf-8')); pos += clen
blen, _ = struct.unpack_from('<II', raw, pos); pos += 8
BUF = raw[pos:pos+blen]

def acc(i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    dt = {5126:'<f4',5123:'<u2',5125:'<u4',5121:'<u1'}[a['componentType']]
    arr = np.frombuffer(BUF, dtype=np.dtype(dt), count=a['count']*n, offset=off)
    return (arr.reshape(a['count'], n) if n > 1 else arr).astype(np.float64 if dt=='<f4' else np.int64)

def src_image(i):
    bv = J['bufferViews'][J['images'][i]['bufferView']]; o = bv.get('byteOffset', 0)
    return Image.open(io.BytesIO(BUF[o:o+bv['byteLength']]))

nodes = J['nodes']; parent = {}
for i, n in enumerate(nodes):
    for c in n.get('children', []): parent[c] = i

def qmat(q):
    x, y, z, w = q
    return np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                     [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                     [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])

def local(n):
    M = np.eye(4)
    M[:3, :3] = qmat(n.get('rotation', [0,0,0,1])) * np.array(n.get('scale', [1,1,1]))
    M[:3, 3] = n.get('translation', [0,0,0])
    return M

def world(i):
    M = local(nodes[i])
    while i in parent:
        i = parent[i]; M = local(nodes[i]) @ M
    return M

# canonical frame: source -x is the head, +y is her back, +z is one wing tip
#   newX = -z (wingspan)   newY = -x (forward)   newZ = +y (up)   det = +1
R = np.array([[0., 0., -1.],
              [-1., 0., 0.],
              [0., 1., 0.]])

parts = []                              # (source node, positions, normals, uvs, indices, material)
for ni, n in enumerate(nodes):
    if n.get('mesh') is None:
        continue
    W = world(ni)
    L = W[:3, :3]
    NRM = np.linalg.inv(L).T            # non-uniform scales in the chain
    for pr in J['meshes'][n['mesh']]['primitives']:
        P = acc(pr['attributes']['POSITION'])
        N = acc(pr['attributes']['NORMAL'])
        UV = acc(pr['attributes']['TEXCOORD_0'])
        I = acc(pr['indices']).reshape(-1, 3)
        Pw = R @ ((L @ P.T) + W[:3, 3:4])
        Nw = R @ (NRM @ N.T)
        Nw /= np.linalg.norm(Nw, axis=0, keepdims=True) + 1e-12
        parts.append([ni, Pw.T, Nw.T, UV, I, pr['material']])

body = next(p for p in parts if len(p[1]) > 100)
wings = [p for p in parts if p is not body]
assert len(wings) == 2, 'expected exactly two wing planes'

allP = np.concatenate([p[1] for p in parts])
centre = np.array([0.0, body[1][:, 1].mean(), 0.0])      # x/z from the wings, y from the body
centre[0] = (allP[:, 0].min() + allP[:, 0].max()) / 2
centre[2] = (body[1][:, 2].min() + body[1][:, 2].max()) / 2
span = allP[:, 0].max() - allP[:, 0].min()
scale = 1.0 / span
for p in parts:
    p[1] = (p[1] - centre) * scale

wings.sort(key=lambda p: -p[1][:, 0].mean())             # right wing (+X) first
right, left = wings

# hinge = midpoint of each wing's inner edge, i.e. the two corners nearest x = 0
def hinge_of(p):
    P = p[1]
    order = np.argsort(np.abs(P[:, 0]))[:2]
    h = P[order].mean(0)
    h[0] = 0.0                                           # keep the pair symmetrical
    return h

for p in (right, left):
    p.append(hinge_of(p))
    p[1] = p[1] - p[6]
body.append(np.zeros(3))

print('wingspan 1.00, body length %.3f, hinge R %s  L %s'
      % (body[1][:, 1].max() - body[1][:, 1].min(),
         np.round(right[6], 3), np.round(left[6], 3)))

# --------------------------------------------------------------- the textures
def tex_source(mat_index):
    return J['textures'][J['materials'][mat_index]['pbrMetallicRoughness']
                         ['baseColorTexture']['index']]['source']

# body: crop the atlas to the region its UVs use, then remap the UVs
bimg = src_image(tex_source(body[5])).convert('RGB')
W0, H0 = bimg.size
u = body[3]
m = 4.0 / max(W0, H0)
u0, u1 = max(0.0, u[:, 0].min()-m), min(1.0, u[:, 0].max()+m)
v0, v1 = max(0.0, u[:, 1].min()-m), min(1.0, u[:, 1].max()+m)
box = (int(u0*W0), int(v0*H0), int(u1*W0), int(v1*H0))
crop = bimg.crop(box)
th = max(1, round(BODY_TEX_W * crop.size[1] / crop.size[0]))
crop = crop.resize((BODY_TEX_W, th), Image.LANCZOS)
bu0, bv0 = box[0]/W0, box[1]/H0
bu1, bv1 = box[2]/W0, box[3]/H0
body[3] = np.stack([(u[:, 0]-bu0)/(bu1-bu0), (u[:, 1]-bv0)/(bv1-bv0)], 1)
buf = io.BytesIO(); crop.save(buf, 'JPEG', quality=88, optimize=True)
body_png = buf.getvalue()
print('body texture %dx%d -> %dx%d, %d KB' % (W0, H0, BODY_TEX_W, th, len(body_png)/1024))

wing_pngs = []
for p in (right, left):
    src = src_image(tex_source(p[5])).convert('RGBA')
    buf = io.BytesIO(); src.save(buf, 'PNG', optimize=True)
    wing_pngs.append(buf.getvalue())
    print('wing texture %dx%d, %d KB' % (src.size[0], src.size[1], len(buf.getvalue())/1024))

# ------------------------------------------------------------- write the glb
bin_parts, bufferViews, accessors = [], [], []
def add_view(data, target=None):
    while sum(len(b) for b in bin_parts) % 4:
        bin_parts.append(b'\0')
    off = sum(len(b) for b in bin_parts)
    bin_parts.append(data)
    bv = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
    if target: bv['target'] = target
    bufferViews.append(bv)
    return len(bufferViews) - 1

def add_acc(arr, ctype, atype, target, minmax=False):
    data = arr.astype({5126:'<f4', 5125:'<u4'}[ctype]).tobytes()
    a = {'bufferView': add_view(data, target), 'componentType': ctype,
         'count': len(arr), 'type': atype}
    if minmax:
        a['min'] = [float(v) for v in np.atleast_2d(arr).min(0)]
        a['max'] = [float(v) for v in np.atleast_2d(arr).max(0)]
    accessors.append(a)
    return len(accessors) - 1

meshes, out_nodes = [], []
for name, p, tex_i, mat_i in (('body', body, 0, 0), ('wingR', right, 1, 1), ('wingL', left, 2, 2)):
    prim = {'attributes': {
                'POSITION': add_acc(p[1], 5126, 'VEC3', 34962, True),
                'NORMAL':   add_acc(p[2], 5126, 'VEC3', 34962),
                'TEXCOORD_0': add_acc(p[3], 5126, 'VEC2', 34962)},
            'indices': add_acc(p[4].reshape(-1), 5125, 'SCALAR', 34963),
            'material': mat_i}
    meshes.append({'name': name, 'primitives': [prim]})
    node = {'name': name, 'mesh': len(meshes) - 1}
    if np.any(p[6]):
        node['translation'] = [float(v) for v in p[6]]
    out_nodes.append(node)

root = {'name': 'butterfly', 'children': [1, 2, 3]}
out_nodes.insert(0, root)

images = [{'bufferView': add_view(body_png), 'mimeType': 'image/jpeg'},
          {'bufferView': add_view(wing_pngs[0]), 'mimeType': 'image/png'},
          {'bufferView': add_view(wing_pngs[1]), 'mimeType': 'image/png'}]

OUT = {
    'asset': {'version': '2.0', 'generator': 'build-butterfly.py'},
    'scene': 0, 'scenes': [{'nodes': [0]}],
    'nodes': out_nodes,
    'meshes': meshes,
    'accessors': accessors,
    'bufferViews': bufferViews,
    'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}],
    'images': images,
    'textures': [{'sampler': 0, 'source': i} for i in range(3)],
    'materials': [
        {'name': 'body', 'doubleSided': False, 'alphaMode': 'OPAQUE',
         'pbrMetallicRoughness': {'baseColorTexture': {'index': 0},
                                  'metallicFactor': 0.2, 'roughnessFactor': 0.6}},
        {'name': 'wingR', 'doubleSided': True, 'alphaMode': 'BLEND',
         'pbrMetallicRoughness': {'baseColorTexture': {'index': 1},
                                  'metallicFactor': 0.0, 'roughnessFactor': 1.0}},
        {'name': 'wingL', 'doubleSided': True, 'alphaMode': 'BLEND',
         'pbrMetallicRoughness': {'baseColorTexture': {'index': 2},
                                  'metallicFactor': 0.0, 'roughnessFactor': 1.0}},
    ],
    'buffers': [{'byteLength': 0}],
}
blob = b''.join(bin_parts)
blob += b'\0' * ((4 - len(blob) % 4) % 4)
OUT['buffers'][0]['byteLength'] = len(blob)

jc = json.dumps(OUT, separators=(',', ':')).encode('utf-8')
jc += b' ' * ((4 - len(jc) % 4) % 4)
glb = (struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jc) + 8 + len(blob))
       + struct.pack('<II', len(jc), 0x4E4F534A) + jc
       + struct.pack('<II', len(blob), 0x004E4942) + blob)
open(DST, 'wb').write(glb)

with open(B64, 'w', encoding='utf-8') as f:
    f.write('/* butterfly.glb as base64, for pages opened straight from disk (file://)\n'
            '   where the browser refuses to fetch a .glb. Built by build-butterfly.py. */\n')
    f.write('window.__BUTTERFLY_GLB_B64__="' + base64.b64encode(glb).decode('ascii') + '";\n')
print('%s  %.0f KB      %s  %.0f KB' % (DST, len(glb)/1024, B64, os.path.getsize(B64)/1024))
