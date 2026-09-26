# Builds layered cut-outs + a clean background plate from assets/roadmap_full.jpg
# Nothing is redesigned or regenerated: every layer is literally pixels from the master.
import json, os
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter

SRC = 'assets/roadmap_full.jpg'
OUT = 'assets/roadmap-layers'
os.makedirs(OUT, exist_ok=True)

master = Image.open(SRC).convert('RGB')
W, H = master.size

# Pieces that sit on the bottom edge of the frame get a strip of bleed below it:
# while they are lifted off their mark they would otherwise uncover a hard band
# of reconstructed plate. The bleed is the piece's own last row of pixels,
# repeated - off-frame once it has landed, and clipped by the stage either way.
BLEED = 26
HE = H + BLEED
master_ext = Image.fromarray(cv2.copyMakeBorder(np.array(master), 0, BLEED, 0, 0,
                                                cv2.BORDER_REPLICATE))

# ---- element regions, traced from the master image (back -> front) ----
# kind: 'poly' | 'ellipse'
ELEMENTS = [
    dict(id='label',    kind='poly', feather=3,
         pts=[(48,28),(314,28),(314,58),(48,58)]),
    dict(id='nav',      kind='poly', feather=3,
         pts=[(694,27),(982,27),(982,54),(694,54)]),
    dict(id='headline', kind='poly', feather=4,
         pts=[(48,88),(514,88),(514,258),(250,264),(246,302),(46,302)]),
    dict(id='copy',     kind='poly', feather=3,
         pts=[(52,336),(360,336),(360,422),(52,422)]),
    dict(id='cta',      kind='poly', feather=4,
         pts=[(54,424),(352,424),(352,494),(54,494)]),
    dict(id='discipline', kind='poly', feather=3,
         pts=[(54,582),(172,582),(172,640),(54,640)]),

    dict(id='note',     kind='poly', feather=5,
         pts=[(888,74),(913,74),(913,92),(973,88),(969,258),(849,264),(852,97),(888,94)]),
    dict(id='books',    kind='poly', feather=5,
         pts=[(372,482),(845,508),(862,518),(860,582),(828,596),(388,560),(370,548)]),
    dict(id='journal',  kind='poly', feather=5,
         pts=[(556,96),(574,86),(842,124),(840,136),(820,492),(812,500),(530,498),(523,474)]),
    dict(id='orb',      kind='ellipse', feather=5,
         box=(386,388,489,483)),
    dict(id='pencup',   kind='poly', feather=5,
         pts=[(872,232),(1020,230),(1019,268),(995,318),(994,466),(970,516),(870,518),(845,466),(846,318),(866,270)]),
    dict(id='notebook', kind='poly', feather=6,
         pts=[(262,586),(404,566),(560,552),(572,560),(578,682),(258,682)]),
    dict(id='pencil',   kind='poly', feather=5,
         pts=[(150,594),(262,584),(268,682),(140,682)]),
    dict(id='laptop',   kind='poly', feather=5,
         pts=[(712,630),(866,596),(952,580),(964,602),(950,636),(928,664),(922,682),(696,682)]),
    dict(id='plant',    kind='poly', feather=7,
         pts=[(1024,388),(1002,408),(986,444),(974,480),(956,508),(906,530),(866,556),(852,584),(874,608),(902,634),(918,664),(924,682),(1024,682)]),
]

def make_mask(el):
    m = Image.new('L', (W, HE), 0)
    d = ImageDraw.Draw(m)
    if el['kind'] == 'poly':
        # anything traced down to the frame edge carries on into the bleed
        d.polygon([(x, HE if y >= H else y) for x, y in el['pts']], fill=255)
    else:
        d.ellipse(el['box'], fill=255)
    return m

geo = {}
hard_union = np.zeros((HE, W), np.uint8)

masks = {}
for el in ELEMENTS:
    m = make_mask(el)
    masks[el['id']] = m
    hard_union = np.maximum(hard_union, np.array(m))
hard_union = hard_union[:H]          # the plate only ever covers the real frame

# ---- clean plate: remove every element, let cv2 rebuild wall/table behind ----
bgr = cv2.cvtColor(np.array(master), cv2.COLOR_RGB2BGR)
hole = cv2.dilate(hard_union, np.ones((9, 9), np.uint8), iterations=1)
plate = cv2.inpaint(bgr, hole, 9, cv2.INPAINT_TELEA)
plate = cv2.inpaint(plate, cv2.dilate(hole, np.ones((5,5),np.uint8)), 5, cv2.INPAINT_NS)
plate = cv2.GaussianBlur(plate, (0, 0), 2.2)
# keep untouched pixels perfectly original, blend only inside the holes
soft = cv2.GaussianBlur(hole.astype(np.float32) / 255.0, (0, 0), 3.0)[..., None]
plate = (plate.astype(np.float32) * soft + bgr.astype(np.float32) * (1 - soft)).astype(np.uint8)
Image.fromarray(cv2.cvtColor(plate, cv2.COLOR_BGR2RGB)).save(f'{OUT}/plate.jpg', quality=92)

# ---- feathered cut-outs ----
for el in ELEMENTS:
    f = el['feather']
    a = masks[el['id']].filter(ImageFilter.GaussianBlur(f))
    arr = np.array(a)
    ys, xs = np.where(arr > 2)
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    layer = master_ext.copy().convert('RGBA')
    layer.putalpha(a)
    layer = layer.crop((x0, y0, x1, y1))
    layer.save(f'{OUT}/{el["id"]}.png')
    geo[el['id']] = dict(left=round(x0 / W * 100, 4), top=round(y0 / H * 100, 4),
                         width=round((x1 - x0) / W * 100, 4), height=round((y1 - y0) / H * 100, 4),
                         bleed=round(max(0, y1 - H) / H * 100, 4))

json.dump(geo, open(f'{OUT}/geometry.json', 'w'), indent=1)

# ---- mask preview for visual QA ----
prev = master.copy().convert('RGB')
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
dd = ImageDraw.Draw(ov)
cols = [(255,0,0),(255,140,0),(255,230,0),(70,220,70),(0,200,220),(60,90,255),(180,60,255),(255,0,160),
        (120,255,0),(0,255,190),(255,90,90),(150,150,255),(255,180,60),(90,255,255),(200,255,90)]
for i, el in enumerate(ELEMENTS):
    c = cols[i % len(cols)]
    if el['kind'] == 'poly':
        dd.polygon(el['pts'], fill=c + (70,), outline=c + (255,))
    else:
        dd.ellipse(el['box'], fill=c + (70,), outline=c + (255,))
prev = Image.alpha_composite(prev.convert('RGBA'), ov).convert('RGB')
prev.save('scratch/mask_preview.png')
print(json.dumps(geo, indent=1))
