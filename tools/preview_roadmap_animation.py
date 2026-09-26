# -*- coding: utf-8 -*-
"""Renders the roadmap cinematic to an mp4 + a contact sheet, straight from
tools/roadmap_timeline.py - the same numbers the CSS keyframes are built from.

This is a review tool, not a deliverable: the live page animates the real DOM
layers. It exists so the choreography can be judged frame by frame.
"""
import os, sys
import numpy as np, cv2, json
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from roadmap_timeline import (TOTAL, SEQ, ORDER, TEXTY, REST,
                              CROSS_A, CROSS_B, track, motion_blur, shadow_mix, opacity)

LAY = os.path.join(ROOT, 'assets', 'roadmap-layers')
OUT = os.path.join(ROOT, 'scratch')
os.makedirs(OUT, exist_ok=True)
FPS = 30
SHADOW_RGB = (66, 58, 104)          # rgba(104,58,66) in BGR

master = cv2.imread(os.path.join(ROOT, 'assets', 'roadmap_full.jpg'))
plate = cv2.imread(os.path.join(LAY, 'plate.jpg'))
H, W = master.shape[:2]
PAD = 48                            # room for the off-frame bleed under the front pieces
WH = H + PAD
plate_ext = cv2.copyMakeBorder(plate, 0, PAD, 0, 0, cv2.BORDER_REPLICATE)
geo = json.load(open(os.path.join(LAY, 'geometry.json')))

BEAT = {eid: (s, e, dx, dy, 0.0 if eid in TEXTY else rot, sc, sh)
        for eid, s, e, dx, dy, rot, sc, sh in SEQ}

# every layer, pre-placed on a full-frame transparent canvas at its resting spot
canvas, pivot = {}, {}
for eid in ORDER:
    g = geo[eid]
    src = np.array(Image.open(os.path.join(LAY, eid + '.png')).convert('RGBA'))
    x0, y0 = round(g['left'] / 100 * W), round(g['top'] / 100 * H)
    h, w = src.shape[:2]
    c = np.zeros((WH, W, 4), np.uint8)
    hh = min(h, WH - y0)
    c[y0:y0 + hh, x0:x0 + w] = src[:hh, :, [2, 1, 0, 3]]     # RGBA -> BGRA
    canvas[eid] = c
    # CSS transform-origin: objects pivot on the surface they land on, type on its centre
    pivot[eid] = (x0 + w / 2, y0 + (h / 2 if eid in TEXTY else h))


def blur_rgba(img, sigma):
    """blur() on an RGBA layer - premultiplied, so edges don't bleed white"""
    if sigma <= 0.01:
        return img
    f = img.astype(np.float32)
    a = f[:, :, 3:4] / 255.0
    pre = f[:, :, :3] * a
    pre = cv2.GaussianBlur(pre, (0, 0), sigma)
    a = cv2.GaussianBlur(a, (0, 0), sigma)[..., None]
    rgb = np.where(a > 1e-4, pre / np.maximum(a, 1e-4), 0)
    return np.concatenate([np.clip(rgb, 0, 255), np.clip(a * 255, 0, 255)], 2).astype(np.uint8)


def over(dst, layer):
    """straight alpha composite of a BGRA layer onto a BGR frame"""
    a = layer[:, :, 3:4].astype(np.float32) / 255.0
    return dst * (1 - a) + layer[:, :, :3].astype(np.float32) * a


def frame(t):
    f = plate_ext.astype(np.float32).copy()
    for eid in ORDER:
        s, e, dx, dy, rot, sc, sh = BEAT[eid]
        k = track(t, s, e)
        px, py = pivot[eid]
        # rotate+scale about the pivot (CSS turns clockwise, cv2 counter-clockwise)
        M = cv2.getRotationMatrix2D((px, py), -rot * k, 1 + (sc - 1) * k)
        M[0, 2] += dx * k
        M[1, 2] += dy * k
        lay = cv2.warpAffine(canvas[eid], M, (W, WH), flags=cv2.INTER_LANCZOS4,
                             borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        lay = blur_rgba(lay, motion_blur(t, s, e))

        if sh:                                   # contact shadow, under the piece
            mul, op = shadow_mix(t, s, e)
            off, rad = sh * mul, sh * mul * 1.2
            a = np.roll(lay[:, :, 3].astype(np.float32) / 255.0, int(round(off)), axis=0)
            a = cv2.GaussianBlur(a, (0, 0), max(rad / 2, .3)) * op
            f = f * (1 - a[..., None]) + np.array(SHADOW_RGB, np.float32) * a[..., None]

        o = opacity(t, s, e)
        if o < 1:
            lay = lay.copy()
            lay[:, :, 3] = (lay[:, :, 3].astype(np.float32) * o).astype(np.uint8)
        f = over(f, lay)

    f = f[:H]                                    # the stage clips at the frame edge
    if t >= CROSS_A:                             # the untouched render returns
        m = min(1.0, (t - CROSS_A) / (CROSS_B - CROSS_A))
        f = f * (1 - m) + master.astype(np.float32) * m
    return np.clip(f, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    n = int(TOTAL * FPS) + 1
    vid = cv2.VideoWriter(os.path.join(OUT, 'roadmap_falls_into_place.mp4'),
                          cv2.VideoWriter_fourcc(*'mp4v'), FPS, (W, H))
    settled = None
    for i in range(n):
        t = i / FPS
        if t >= CROSS_B:                         # nothing moves any more
            settled = master if settled is None else settled
            img = settled
        else:
            img = frame(t)
        vid.write(img)
        if i % 30 == 0:
            print('  %4.1fs' % t, flush=True)
    vid.release()

    # contact sheet of the beats that matter
    keys = [0.0, 1.5, 2.6, 3.6, 4.8, 5.8, 6.7, 7.8, 8.6, TOTAL]
    tile = [cv2.resize(frame(min(t, CROSS_B - .01)) if t < CROSS_B else master,
                       (W // 2, H // 2), interpolation=cv2.INTER_AREA) for t in keys]
    rows = [np.hstack(tile[i:i + 5]) for i in (0, 5)]
    sheet = np.vstack(rows)
    for j, t in enumerate(keys):
        x, y = (j % 5) * (W // 2) + 14, (j // 5) * (H // 2) + 30
        cv2.putText(sheet, '%.1fs' % t, (x, y), cv2.FONT_HERSHEY_SIMPLEX, .7, (40, 30, 60), 2, cv2.LINE_AA)
    cv2.imwrite(os.path.join(OUT, 'roadmap_contact_sheet.png'), sheet)

    # how far off the settled frame is from the untouched master
    d = np.abs(frame(TOTAL).astype(np.int16) - master.astype(np.int16)).max()
    print('wrote scratch/roadmap_falls_into_place.mp4 and scratch/roadmap_contact_sheet.png')
    print('final frame vs master: max channel difference =', d)
