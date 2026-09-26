# -*- coding: utf-8 -*-
"""The single source of truth for the roadmap "everything falls into place" beat sheet.

build_roadmap_animation.py turns this into CSS keyframes for the live page;
preview_roadmap_animation.py renders the very same numbers to an mp4 so the
motion can be reviewed frame by frame.
"""

TOTAL = 10.0
HOLD = 1.50          # the composition sits slightly unsettled until here

# id, fall_start, land, dx, dy (px @1024 master; dy is negative = starts high and
# falls down), rot deg, start scale, contact-shadow px (0 = none)
SEQ = [
    ('label',      1.50, 2.55,  -2, -11,  0.00, 1.000,  0),
    ('nav',        1.70, 2.78,   2, -11,  0.00, 1.000,  0),
    ('headline',   1.95, 3.60,  -3, -18,  0.00, 1.010,  0),
    ('copy',       2.35, 3.55,  -2, -13,  0.00, 1.000,  0),
    ('cta',        2.60, 3.85,   2, -14,  0.00, 0.994,  0),
    ('books',      2.95, 4.80,  -5, -22, -0.40, 1.006, 18),
    ('journal',    3.40, 5.20,   4, -26,  0.55, 1.009, 22),
    ('orb',        3.95, 5.25,  -4, -17,  0.00, 1.012, 11),
    ('note',       4.20, 5.40,   3, -15,  0.75, 1.006, 12),
    ('pencup',     4.60, 6.25,   4, -20, -0.45, 1.008, 15),
    ('notebook',   5.05, 6.70,  -6, -13, -0.30, 1.008, 16),
    ('pencil',     5.45, 6.60,  -4, -12, -0.70, 1.006,  0),
    ('laptop',     5.70, 7.40,   6, -11,  0.28, 1.007, 15),
    ('plant',      6.05, 7.80,   7, -12,  0.45, 1.010,  0),
    ('discipline', 6.35, 7.55,   0, -10,  0.00, 1.000,  0),
]
# paint order, back -> front
ORDER = ['label', 'nav', 'headline', 'copy', 'cta', 'discipline',
         'note', 'pencup', 'journal', 'books', 'orb', 'notebook', 'pencil', 'laptop', 'plant']
LABEL = {
    'label': 'MY ROADMAP label', 'nav': 'top navigation', 'headline': 'A Bigger Me headline',
    'copy': 'supporting paragraph', 'cta': 'Open My Roadmap button',
    'discipline': 'Discipline Creates Freedom caption',
    'note': 'Better Things Ahead note', 'pencup': 'pen cup and pens', 'journal': 'A Bigger Me journal',
    'books': 'stacked books', 'orb': 'pink glass orb', 'notebook': 'foreground notebook',
    'pencil': 'pink pencil', 'laptop': 'laptop', 'plant': 'flowering plant',
}
TEXTY = {'label', 'nav', 'headline', 'copy', 'cta', 'discipline'}   # never tilted

# easing curves, as CSS cubic-bezier control points
HOLD_EASE   = (.45, 0, .55, 1)      # the near-still float before the fall
FALL_EASE   = (.36, .01, .18, 1)    # weight: gentle release, long deceleration
SETTLE_EASE = (.25, .8, .35, 1)     # the last millimetre easing shut

DRIFT   = .94        # fraction of the offset still left when the fall begins
SETTLE  = -.05       # tiny overshoot past the mark, then back - weight, not bounce
REST    = .30        # seconds the settle takes to close
BLUR_AT = .55        # where in the fall the motion blur peaks
CROSS_A, CROSS_B = 8.35, 8.62   # the untouched master render returns here


def bezier(c, t):
    """y of a CSS cubic-bezier(c) at progress t in [0,1] (Newton, then bisection)."""
    x1, y1, x2, y2 = c
    if t <= 0:
        return 0.0
    if t >= 1:
        return 1.0

    def bx(u):
        return 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3

    def by(u):
        return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3

    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if bx(mid) < t:
            lo = mid
        else:
            hi = mid
    return by((lo + hi) / 2)


def track(t, s, e):
    """Offset multiplier k at time t: 1 = fully displaced, 0 = exactly in place."""
    if t <= 0:
        return 1.0
    if t < s:                       # the hold: a barely perceptible float
        return 1.0 + (DRIFT - 1.0) * bezier(HOLD_EASE, t / s)
    if t < e:                       # the fall
        return DRIFT + (SETTLE - DRIFT) * bezier(FALL_EASE, (t - s) / (e - s))
    if t < e + REST:                # the settle
        return SETTLE + (0 - SETTLE) * bezier(SETTLE_EASE, (t - e) / REST)
    return 0.0


def motion_blur(t, s, e):
    """px of blur on a piece at time t - peaks mid-fall, gone once it lands."""
    mid = s + (e - s) * BLUR_AT
    pts = [(0, .50), (s, .58), (mid, .95), (e, .14), (e + REST, 0.0)]
    if t <= 0:
        return pts[0][1]
    for (t0, v0), (t1, v1) in zip(pts, pts[1:]):
        if t <= t1:
            return v0 + (v1 - v0) * ((t - t0) / (t1 - t0) if t1 > t0 else 1)
    return 0.0


def shadow_mix(t, s, e):
    """(scale, opacity) of the contact shadow: lifted and soft -> pressed and faint."""
    mid = s + (e - s) * BLUR_AT
    pts = [(0, 1.00, .28), (s, .92, .26), (mid, .70, .22), (e, .26, .11), (e + REST, .06, .06)]
    if t <= 0:
        return pts[0][1], pts[0][2]
    for (t0, m0, o0), (t1, m1, o1) in zip(pts, pts[1:]):
        if t <= t1:
            f = (t - t0) / (t1 - t0) if t1 > t0 else 1
            return m0 + (m1 - m0) * f, o0 + (o1 - o0) * f
    return pts[-1][1], pts[-1][2]


def opacity(t, s, e):
    if t < s:
        return .92 + .04 * (t / s if s else 1)
    if t < e:
        return .96 + .04 * bezier(FALL_EASE, (t - s) / (e - s))
    return 1.0
