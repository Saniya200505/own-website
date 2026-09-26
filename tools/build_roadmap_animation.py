# -*- coding: utf-8 -*-
"""Rebuilds the roadmap "everything falls into place" cinematic.

Nothing here draws, recolours or re-typesets anything: every moving layer is a
feathered pixel cut-out of assets/roadmap_full.jpg (see build_roadmap_layers.py)
and the last second and a half of the timeline is the untouched master render.
This script only writes the choreography - the CSS keyframes and the markup for
the layer stack - into marginalia-bookstore.html and the Next app.
"""
import json, io, re

import os as _os
geo = json.load(open(_os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), 'assets', 'roadmap-layers', 'geometry.json')))

import sys
sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
from roadmap_timeline import (TOTAL, HOLD, SEQ, ORDER, LABEL, TEXTY,
                              HOLD_EASE, FALL_EASE, SETTLE_EASE,
                              DRIFT, SETTLE, REST, BLUR_AT, CROSS_A, CROSS_B)


def cb(c):           # control points -> a CSS cubic-bezier()
    return 'cubic-bezier(%s)' % ','.join(('%g' % v).lstrip('0') or '0' for v in c)


def u(px):           # px in the 1024-wide master -> container-width units
    return '%.4fcqw' % (px / 1024 * 100)


def tf(dx, dy, rot, sc, k):
    if k == 0:
        return 'translate3d(0,0,0) rotate(0deg) scale(1)'
    return 'translate3d(%s, %s, 0) rotate(%.4fdeg) scale(%.5f)' % (
        u(dx * k), u(dy * k), rot * k, 1 + (sc - 1) * k)


def filt(sh, mul, op, blur):
    """contact shadow (if the piece casts one) + a whisper of motion blur"""
    parts = []
    if sh:
        parts.append('drop-shadow(0 %s %s rgba(104,58,66,%.2f))'
                     % (u(sh * mul), u(sh * mul * 1.2), op))
    parts.append('blur(%.2fpx)' % blur)
    return ' '.join(parts)


def pc(t):
    return t / TOTAL * 100


css = io.StringIO()
w = css.write
HEAD = """/* ==== roadmap "everything falls into place" cinematic - BEGIN (generated) ====
   tools/build_roadmap_animation.py writes this block - hand edits get overwritten.

   Every layer is a feathered pixel cut-out of assets/roadmap_full.jpg; the wall
   and table behind them are that same render with those pixels reconstructed.
   Nothing is redrawn, recoloured, re-typeset or added.

   @TOTAL@s: 0-@HOLD@s the pieces hold a few pixels above their marks, barely
   drifting; @HOLD@-6.5s they fall one after another under the same gravity -
   heavy pieces slower, small ones home first; 6.5-7.8s the stragglers align;
   each landing overshoots by a fraction of a pixel and eases shut. At @CA@s the
   master render cross-fades back in, so the closing @STILL@s is the reference
   image itself, motionless. */
.rm-stage{
  position:absolute; inset:0; z-index:1; opacity:0;
  container-type:inline-size;
  border-radius:var(--r-lg); overflow:hidden; pointer-events:none;
}
.featured-roadmap-card.is-playing .rm-stage{opacity:1}
.rm-plate{position:absolute; inset:0; width:100%; height:100%; display:block; object-fit:fill}
.rm-el{
  position:absolute; display:block; height:auto;
  transform-origin:50% 100%;   /* objects pivot on the surface they land on */
  backface-visibility:hidden;
}
.rm-el--type{transform-origin:50% 50%}
.roadmap-master-img{position:relative; z-index:2}
.featured-roadmap-card.is-playing .rm-el{
  will-change:transform, opacity, filter;
  animation-duration:@TOTAL@s; animation-fill-mode:both; animation-timing-function:linear;
}
/* the untouched render returns once the last piece has landed, then holds still */
@keyframes rm-master{
  0%, @CA@%{opacity:0}
  @CB@%, 100%{opacity:1}
}
.featured-roadmap-card.is-playing .roadmap-master-img{animation:rm-master @TOTAL@s linear both}
.featured-roadmap-card.is-playing .roadmap-overlay-nav,
.featured-roadmap-card.is-playing .roadmap-overlay-btn{pointer-events:none}
.featured-roadmap-card.is-playing{transform:none!important}

/* no JS, or reduced motion: the reference image, untouched */
@media (prefers-reduced-motion:reduce){
  .rm-stage{display:none}
  .featured-roadmap-card.is-playing .roadmap-master-img{animation:none; opacity:1}
}
"""
w(HEAD.replace('@TOTAL@', '%.2f' % TOTAL)
      .replace('@HOLD@', '%.1f' % HOLD)
      .replace('@STILL@', '%.2f' % (TOTAL - CROSS_B))
      .replace('@CA@', '%.4f' % pc(CROSS_A))
      .replace('@CB@', '%.4f' % pc(CROSS_B)))

for eid, s, e, dx, dy, rot, sc, sh in SEQ:
    g = geo[eid]
    rot = 0.0 if eid in TEXTY else rot          # never tilt the typography
    mid = s + (e - s) * BLUR_AT
    rest = e + REST

    # --- transform + opacity: hold, fall, overshoot a hair, settle ---
    w('\n@keyframes rm-%s{\n' % eid)
    w('  0%%{transform:%s; opacity:.92; animation-timing-function:%s}\n'
      % (tf(dx, dy, rot, sc, 1), cb(HOLD_EASE)))
    w('  %.4f%%{transform:%s; opacity:.96; animation-timing-function:%s}\n'
      % (pc(s), tf(dx, dy, rot, sc, DRIFT), cb(FALL_EASE)))
    w('  %.4f%%{transform:%s; opacity:1; animation-timing-function:%s}\n'
      % (pc(e), tf(dx, dy, rot, sc, SETTLE), cb(SETTLE_EASE)))
    w('  %.4f%%, 100%%{transform:%s; opacity:1}\n' % (pc(rest), tf(dx, dy, rot, sc, 0)))
    w('}\n')

    # --- filter on its own track so the motion blur can peak mid-fall ---
    w('@keyframes rm-%s-f{\n' % eid)
    w('  0%%{filter:%s}\n'                 % filt(sh, 1.00, .28, .50))
    w('  %.4f%%{filter:%s}\n' % (pc(s),      filt(sh,  .92, .26, .58)))
    w('  %.4f%%{filter:%s}\n' % (pc(mid),    filt(sh,  .70, .22, .95)))
    w('  %.4f%%{filter:%s}\n' % (pc(e),      filt(sh,  .26, .11, .14)))
    w('  %.4f%%, 100%%{filter:%s}\n' % (pc(rest), filt(sh, .06, .06, 0)))
    w('}\n')

    w('.rm-el--%s{left:%.4f%%; top:%.4f%%; width:%.4f%%}\n' % (eid, g['left'], g['top'], g['width']))
    w('.featured-roadmap-card.is-playing .rm-el--%s{animation-name:rm-%s, rm-%s-f}\n' % (eid, eid, eid))
w('/* ==== roadmap "everything falls into place" cinematic - END ==== */\n')
css_block = css.getvalue()

html = io.StringIO()
h = html.write
h('      <!-- rm-stage: cut-out layers of the master render (generated) -->\n')
h('      <div class="rm-stage" aria-hidden="true">\n')
h('        <img class="rm-plate" src="assets/roadmap-layers/plate.jpg" alt="" draggable="false" loading="lazy" decoding="async">\n')
for eid in ORDER:
    cls = 'rm-el rm-el--%s%s' % (eid, ' rm-el--type' if eid in TEXTY else '')
    h('        <img class="%s" src="assets/roadmap-layers/%s.png" alt="" draggable="false" loading="lazy" decoding="async"><!-- %s -->\n'
      % (cls, eid, LABEL[eid]))
h('      </div>\n')
html_block = html.getvalue()

import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rel(*parts):
    return os.path.join(ROOT, *parts)


# the playback JS in both targets keys off the same numbers
OLD_NOTE = re.compile(
    r'One \d+(?:\.\d+)?s pass the first time the card comes into view: the cut-out layers\n'
    r'(\s*)settle, the master render cross-fades back at [\d.]+s, and the final [\d.]+s\n'
    r'(\s*)is the untouched reference image, perfectly still\.')


def retime_js(text):
    text = OLD_NOTE.sub(
        lambda m: ('One %.0fs pass the first time the card comes into view: the pieces hold,\n'
                   '%sfall into place one after another, and at %.2fs the master render\n'
                   '%scross-fades back, so the final %.2fs is the untouched reference image.'
                   % (TOTAL, m.group(1), CROSS_A, m.group(2), TOTAL - CROSS_B)), text)
    text = re.sub(r'(the last one \(or 2\.5s\), then run the single )\d+(?:\.\d+)?s( pass)',
                  lambda m: '%s%.0fs%s' % (m.group(1), TOTAL, m.group(2)), text)
    text = re.sub(r'(setTimeout\(finish, )\d+(\)[\s;,)]*//\s*safety net)',
                  lambda m: '%s%d%s' % (m.group(1), int(TOTAL * 1000) + 600, m.group(2)), text)
    return text


# ---- target 2: the Next app (components/Featured.jsx owns the markup) ----
NEXT_CSS = rel('marginalia-next', 'app', 'globals.css')
NEXT_JSX = rel('marginalia-next', 'components', 'Featured.jsx')
CSS_BLOCK_RE = re.compile(
    r'\n/\* ==== roadmap "(?:falling into place|everything falls into place)" cinematic'
    r' - BEGIN.*?- END ==== \*/\n', re.S)

if os.path.exists(NEXT_CSS):
    g = CSS_BLOCK_RE.sub('\n', open(NEXT_CSS, encoding='utf-8').read())
    k = g.index('}', g.index('.added-badge{')) + 1
    open(NEXT_CSS, 'w', encoding='utf-8').write(g[:k] + '\n\n' + css_block + g[k:])
    print('patched', os.path.relpath(NEXT_CSS, ROOT))

if os.path.exists(NEXT_JSX):
    jsx = io.StringIO()
    jw = jsx.write
    IMG = ('          <img className="%s" src="/assets/roadmap-layers/%s" alt=""'
           ' draggable="false" loading="lazy" decoding="async" />\n')
    jw('        {/* rm-stage: BEGIN (generated by tools/build_roadmap_animation.py) */}\n')
    jw('        <div className="rm-stage" aria-hidden="true">\n')
    jw(IMG % ('rm-plate', 'plate.jpg'))
    for eid in ORDER:
        cls = 'rm-el rm-el--%s%s' % (eid, ' rm-el--type' if eid in TEXTY else '')
        jw('          {/* %s */}\n' % LABEL[eid])
        jw(IMG % (cls, eid + '.png'))
    jw('        </div>\n')
    jw('        {/* rm-stage: END */}\n')
    f = open(NEXT_JSX, encoding='utf-8').read()
    pat = re.compile(r'[ ]*\{/\* rm-stage: BEGIN.*?\{/\* rm-stage: END \*/\}\n', re.S)
    assert pat.search(f), 'rm-stage sentinels missing from Featured.jsx'
    f = pat.sub(lambda m: jsx.getvalue(), f, count=1)
    open(NEXT_JSX, 'w', encoding='utf-8').write(retime_js(f))
    print('patched', os.path.relpath(NEXT_JSX, ROOT))

# ---- target 1: the standalone page ----
src = open(rel('marginalia-bookstore.html'), encoding='utf-8').read()

# drop any previous generation
src = re.sub(r'\n/\* -+ roadmap "falling into place".*?\.rm-el--plant\{[^}]*\}\n', '\n', src, flags=re.S)
src = CSS_BLOCK_RE.sub('\n', src)
src = re.sub(r'[ ]*<!-- (?:cinematic layer stack|rm-stage)[^\n]*\n\s*<div class="rm-stage".*?</div>\n', '', src, flags=re.S)

j = src.index('}', src.index('.added-badge{')) + 1
src = src[:j] + '\n\n' + css_block + src[j:]

anchor = '      <!-- Full width master image base (100% accurate, pristine render) -->\n'
assert anchor in src
src = src.replace(anchor, html_block + anchor, 1)

open(rel('marginalia-bookstore.html'), 'w', encoding='utf-8').write(retime_js(src))
print('rebuilt: %d layers | hold 0-%.1fs | first fall %.2fs | last landing %.2fs (+%.2fs settle)'
      ' | master back %.2fs | still %.2fs'
      % (len(SEQ), HOLD, min(s for _, s, *_ in SEQ), max(e for _, _, e, *_ in SEQ), REST,
         CROSS_A, TOTAL - CROSS_B))
