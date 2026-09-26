"""
Rebuilds assets/girl.glb (and the base64 copy used on file://) from the original
girl.glb that came with the project.

  * re-encodes the 4.8 MB PNG atlas as JPEG and marks the material OPAQUE
    (its alpha channel is solid 255 everywhere), 9.8 MB -> ~5.6 MB
  * drops the imported "animation", which is only a two-key T-pose snapshot
  * bakes a "smile" morph target: the doll has no blend shapes, so the wide
    smile is a displacement field over the mouth corners, lip line and cheeks,
    stored as a sparse accessor (~570 of 73k vertices actually move)

Run:  python build-model.py
"""
import struct, json, io, base64, os
import numpy as np
from PIL import Image

SRC, DST, B64 = 'girl.glb', 'assets/girl.glb', 'assets/girl-model.js'
TEX_SIZE, QUALITY = 2048, 85

# ---------------------------------------------------------------- read source
with open(SRC, 'rb') as f:
    f.read(12)
    clen, _ = struct.unpack('<II', f.read(8)); J = json.loads(f.read(clen).decode('utf-8'))
    blen, _ = struct.unpack('<II', f.read(8)); BUF = f.read(blen)

def bv_bytes(i):
    bv = J['bufferViews'][i]; o = bv.get('byteOffset', 0)
    return BUF[o:o + bv['byteLength']]

def acc(i):
    a = J['accessors'][i]; bv = J['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    n = {'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    dt = {5126:'<f4',5123:'<u2',5125:'<u4',5121:'<u1'}[a['componentType']]
    arr = np.frombuffer(BUF, dtype=np.dtype(dt), count=a['count']*n, offset=off)
    return arr.reshape(a['count'], n) if n > 1 else arr

prim = J['meshes'][0]['primitives'][0]
P  = acc(prim['attributes']['POSITION']).astype(np.float64)
N  = acc(prim['attributes']['NORMAL']).astype(np.float64)
JO = acc(prim['attributes']['JOINTS_0']).astype(np.int64)
WE = acc(prim['attributes']['WEIGHTS_0']).astype(np.float64)

# ------------------------------------------------- bind-pose skinning matrices
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
    M[:3,:3] = qmat(n.get('rotation', [0,0,0,1])) * np.array(n.get('scale', [1,1,1]))
    M[:3,3] = n.get('translation', [0,0,0])
    return M

def world(i):
    M = local(nodes[i])
    while i in parent:
        i = parent[i]; M = local(nodes[i]) @ M
    return M

skin = J['skins'][0]
IBM = acc(skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
SK  = np.stack([world(j) for j in skin['joints']]) @ IBM          # per joint

M = np.zeros((len(P), 3, 4))                                      # per vertex
for k in range(4):
    M += WE[:, k, None, None] * SK[JO[:, k]][:, :3, :]
Pw = np.einsum('vij,vj->vi', M, np.concatenate([P, np.ones((len(P), 1))], 1))
Nw = np.einsum('vij,vj->vi', M[:, :, :3], N)
Nw /= np.linalg.norm(Nw, axis=1, keepdims=True) + 1e-12

# ------------------------------------------------------- the smile deformation
# coordinates read off a front orthographic render of the head:
# mouth corners (+-0.0315, 0.7065), lip line y 0.7015, cheeks (+-0.058, 0.7225)
def smoothstep(u):
    u = np.clip(u, 0, 1)
    return u * u * (3 - 2 * u)

x, y, z = Pw[:, 0], Pw[:, 1], Pw[:, 2]
face = (Nw[:, 2] > -0.15) & (z > 0.03) & (y > 0.66) & (y < 0.80)

def blob(cx, cy, rx, ry):
    return smoothstep(1.0 - np.hypot((x - cx) / rx, (y - cy) / ry)) * face

Dw = np.zeros_like(Pw)
for s in (-1, 1):                                  # corners: out, up, tucked in
    w = blob(s * 0.0315, 0.7065, 0.032, 0.026)
    Dw[:, 0] += w * s * 0.0090
    Dw[:, 1] += w * 0.0082
    Dw[:, 2] += w * -0.0010
w = blob(0.0, 0.7015, 0.048, 0.017)                # lip line bows up
Dw[:, 1] += w * 0.0028
for s in (-1, 1):                                  # cheeks lift under the eyes
    w = blob(s * 0.058, 0.7225, 0.034, 0.030)
    Dw[:, 0] += w * s * 0.0012
    Dw[:, 1] += w * 0.0050
    Dw[:, 2] += w * 0.0022

Dw *= 1.6                                          # full influence = a broad grin

moved = np.where(np.abs(Dw).max(1) > 1e-6)[0]
# world delta -> geometry space (morph targets are applied before skinning)
Dl = np.zeros((len(moved), 3), np.float32)
for n, vi in enumerate(moved):
    Dl[n] = np.linalg.solve(M[vi][:, :3], Dw[vi])
print('smile morph: %d vertices, max local delta %.5f' % (len(moved), np.abs(Dl).max()))

# --------------------------------------------------------------- edit the json
img_bv = J['images'][0]['bufferView']
im = Image.open(io.BytesIO(bv_bytes(img_bv))).convert('RGB')
if im.size[0] != TEX_SIZE:
    im = im.resize((TEX_SIZE, TEX_SIZE), Image.LANCZOS)
out = io.BytesIO(); im.save(out, 'JPEG', quality=QUALITY, optimize=True, subsampling=0)
jpeg = out.getvalue()
J['images'][0]['mimeType'] = 'image/jpeg'
J.pop('animations', None)
for m in J['materials']:
    m['alphaMode'] = 'OPAQUE'

extra = {}                                          # bufferView index -> bytes
idx_bv = len(J['bufferViews'])
extra[idx_bv] = moved.astype('<u4').tobytes()
J['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': len(extra[idx_bv])})
val_bv = len(J['bufferViews'])
extra[val_bv] = Dl.astype('<f4').tobytes()
J['bufferViews'].append({'buffer': 0, 'byteOffset': 0, 'byteLength': len(extra[val_bv])})

J['accessors'].append({
    'type': 'VEC3', 'componentType': 5126, 'count': len(P),
    'min': [float(min(0, Dl[:, i].min())) for i in range(3)],
    'max': [float(max(0, Dl[:, i].max())) for i in range(3)],
    'sparse': {'count': len(moved),
               'indices': {'bufferView': idx_bv, 'byteOffset': 0, 'componentType': 5125},
               'values': {'bufferView': val_bv, 'byteOffset': 0}}
})
prim['targets'] = [{'POSITION': len(J['accessors']) - 1}]
J['meshes'][0]['weights'] = [0.0]
J['meshes'][0].setdefault('extras', {})['targetNames'] = ['smile']

# ------------------------------------------------------------ rebuild the glb
used = set(extra)
for a in J['accessors']:
    if 'bufferView' in a:
        used.add(a['bufferView'])
    for sp in a.get('sparse', {}).values():
        if isinstance(sp, dict) and 'bufferView' in sp:
            used.add(sp['bufferView'])
for i in J['images']:
    if 'bufferView' in i:
        used.add(i['bufferView'])

blob_out, remap, new_bvs = bytearray(), {}, []
for i, bv in enumerate(J['bufferViews']):
    if i not in used:
        continue
    data = extra[i] if i in extra else (jpeg if i == img_bv else bv_bytes(i))
    while len(blob_out) % 4:
        blob_out.append(0)
    nbv = {'buffer': 0, 'byteOffset': len(blob_out), 'byteLength': len(data)}
    if i not in extra:
        for k in ('byteStride', 'target'):
            if k in bv:
                nbv[k] = bv[k]
    remap[i] = len(new_bvs); new_bvs.append(nbv); blob_out += data

for a in J['accessors']:
    if 'bufferView' in a:
        a['bufferView'] = remap[a['bufferView']]
    for sp in a.get('sparse', {}).values():
        if isinstance(sp, dict) and 'bufferView' in sp:
            sp['bufferView'] = remap[sp['bufferView']]
for i in J['images']:
    if 'bufferView' in i:
        i['bufferView'] = remap[i['bufferView']]
J['bufferViews'] = new_bvs
J['buffers'] = [{'byteLength': len(blob_out)}]

jc = json.dumps(J, separators=(',', ':')).encode('utf-8')
jc += b' ' * ((4 - len(jc) % 4) % 4)
while len(blob_out) % 4:
    blob_out.append(0)
glb = (struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jc) + 8 + len(blob_out))
       + struct.pack('<II', len(jc), 0x4E4F534A) + jc
       + struct.pack('<II', len(blob_out), 0x004E4942) + bytes(blob_out))
open(DST, 'wb').write(glb)

with open(B64, 'w', encoding='utf-8') as f:
    f.write('/* girl.glb as base64 so the page also works when opened straight from disk\n'
            '   (file://), where the browser refuses to fetch the .glb. Built by\n'
            '   build-model.py - do not edit by hand. Loaded on demand, never over http. */\n')
    f.write('window.__GIRL_GLB_B64__="' + base64.b64encode(glb).decode('ascii') + '";\n')
print('%s  %.2f MB      %s  %.2f MB' % (DST, len(glb) / 1048576, B64, os.path.getsize(B64) / 1048576))
