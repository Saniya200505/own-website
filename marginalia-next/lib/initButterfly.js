/*
  A blue morpho, built out of butterfly.zip by build-butterfly.py into three
  nodes: a body and two wings hinged on the body midline.

  She lives on a small fixed canvas that is moved around with a transform, so
  she stays with the reader on every part of every page: she chases the cursor
  loosely - never straight at it, always drifting a little past and coming back -
  she is thrown off course when the page scrolls under her, and when everything
  goes still for a moment she picks a spot nearby, settles onto it and just opens
  and closes her wings until you move again.

  Nothing here can take a click: the canvas is pointer-events:none. Visitors who
  ask for reduced motion never get her at all.

  Returns a cleanup function so the React component can tear everything down.
*/
export default function initButterfly(canvas) {
  const THREE = window.THREE;
  const noop = () => {};
  if (!canvas || !THREE || !THREE.GLTFLoader) return noop;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
  } catch (e) { return noop; }

  let disposed = false;
  const cleanups = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  /* ---------- look ---------- */
  const SPAN_PX   = 62;     // wingspan on screen, css px (the model spans 1 unit)
  const IDLE_MS   = 1150;   // stillness before she comes down to land
  const MARGIN    = 54;     // keep her this far inside the viewport

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 40);
  /* the wing texture is a photograph and is already lit, so keep the lighting
     flat enough that a wing tipped on edge never goes black */
  scene.add(new THREE.AmbientLight(0xffffff, 1.05));
  const sun = new THREE.DirectionalLight(0xfff4ec, 0.75); sun.position.set(0.6, 1.2, 2.0);
  const back = new THREE.DirectionalLight(0xf3d9df, 0.35); back.position.set(-0.8, -0.6, -1.6);
  scene.add(sun, back);

  /* heading (screen) > pitch > bank > model, so each rotation stays independent */
  const heading = new THREE.Group();
  const pitch   = new THREE.Group();
  const bank    = new THREE.Group();
  heading.add(pitch); pitch.add(bank); scene.add(heading);

  let wingL = null, wingR = null, ready = false;

  /* ---------- state ---------- */
  const vw = () => document.documentElement.clientWidth;
  const vh = () => document.documentElement.clientHeight;

  const pos    = {x: vw() + 120, y: vh() * 0.34};     // flies in from off-stage
  const vel    = {x: -260, y: 40};
  const cursor = {x: vw() * 0.62, y: vh() * 0.42, seen: false};
  const perch  = {x: 0, y: 0};

  let mode = 'fly';                 // fly | land | rest
  let dir = -Math.PI / 2, bankA = 0, pitchA = 0;
  let flapPhase = 0, flap = 0, restT = 0, scrollBoost = 0;
  let lastActivity = performance.now(), lastScrollY = window.scrollY;
  const seed = Math.random() * 100;

  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const lerp  = (a, b, t) => a + (b - a) * t;

  /* ---------- input ---------- */
  on(window, 'pointermove', e => {
    if (Math.abs(e.clientX - cursor.x) + Math.abs(e.clientY - cursor.y) > 3) {
      lastActivity = performance.now();
    }
    cursor.x = e.clientX; cursor.y = e.clientY; cursor.seen = true;
  }, {passive: true});

  on(window, 'scroll', () => {
    const y = window.scrollY;
    const d = clamp(y - lastScrollY, -160, 160);
    lastScrollY = y;
    lastActivity = performance.now();
    scrollBoost = Math.min(1, scrollBoost + Math.abs(d) / 90);
    /* smooth scrolling fires a burst of these, so the shove has to stay bounded */
    vel.y = clamp(vel.y - d * 1.25, -680, 680);
    vel.x = clamp(vel.x + (Math.random() - 0.5) * Math.abs(d) * 0.8, -680, 680);
  }, {passive: true});

  on(window, 'resize', () => {
    pos.x = clamp(pos.x, MARGIN, vw() - MARGIN);
    pos.y = clamp(pos.y, MARGIN, vh() - MARGIN);
    if (mode === 'rest') { perch.x = pos.x; perch.y = pos.y; }
  }, {passive: true});

  function pickPerch() {
    const a = Math.random() * Math.PI * 2;
    const r = 95 + Math.random() * 105;
    perch.x = clamp(cursor.x + Math.cos(a) * r, MARGIN, vw() - MARGIN);
    perch.y = clamp(cursor.y + Math.sin(a) * r, MARGIN, vh() - MARGIN);
  }

  /* ---------- flight ---------- */
  function fly(dt, now) {
    const still = now - lastActivity;
    scrollBoost = Math.max(0, scrollBoost - dt * 1.6);

    if (mode === 'rest' || mode === 'land') {
      if (still < 120 || scrollBoost > 0.08) {           // startled back into the air
        if (mode === 'rest') {
          vel.y -= 150 + Math.random() * 90;
          vel.x += (Math.random() - 0.5) * 240;
          flapPhase = 0;
        }
        mode = 'fly';
      }
    } else if (still > IDLE_MS && scrollBoost < 0.05 &&
               Math.hypot(pos.x - cursor.x, pos.y - cursor.y) < 340) {
      mode = 'land';                                   // close enough to settle nearby
      pickPerch();
    }

    const t = now / 1000 + seed;
    let tx, ty, k, c;

    if (mode === 'land' || mode === 'rest') {
      tx = perch.x; ty = perch.y; k = 9; c = 6.2;
    } else {
      /* never aim at the cursor itself - orbit a wandering point beside it */
      tx = cursor.x + Math.cos(t * 0.61) * 118 + Math.cos(t * 1.77 + 1.3) * 34;
      ty = cursor.y + Math.sin(t * 0.47) * 96  + Math.sin(t * 2.13 + 0.6) * 28;
      tx = clamp(tx, MARGIN, vw() - MARGIN);
      ty = clamp(ty, MARGIN, vh() - MARGIN);
      k = 3.1; c = 2.9;
    }

    let ax = (tx - pos.x) * k - vel.x * c;
    let ay = (ty - pos.y) * k - vel.y * c;

    if (mode === 'fly') {                                 // erratic butterfly drift
      const gust = 150 + scrollBoost * 260;
      ax += (Math.sin(t * 3.1) + Math.sin(t * 5.7 + 2.1) * 0.6) * gust;
      ay += (Math.cos(t * 2.7 + 1.1) + Math.cos(t * 6.3) * 0.6) * gust;
      ay -= Math.sin(flapPhase) * 90;                     // bob on the wingbeat
    }

    vel.x += ax * dt; vel.y += ay * dt;
    const sp = Math.hypot(vel.x, vel.y), MAX = 1150;
    if (sp > MAX) { vel.x *= MAX / sp; vel.y *= MAX / sp; }
    pos.x += vel.x * dt; pos.y += vel.y * dt;

    if (mode === 'land' && Math.hypot(pos.x - perch.x, pos.y - perch.y) < 9 && sp < 70) {
      mode = 'rest'; restT = 0;
      pos.x = perch.x; pos.y = perch.y; vel.x = vel.y = 0;
    }
    if (mode === 'rest') { vel.x = vel.y = 0; pos.x = perch.x; pos.y = perch.y; }

    pos.x = clamp(pos.x, MARGIN, vw() - MARGIN);
    pos.y = clamp(pos.y, MARGIN, vh() - MARGIN);

    /* --- which way she is pointing --- */
    const shortest = a => ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    /* on the way down she turns upright, so she always comes to rest head-up
       on the page rather than sideways or upside down */
    const settling = mode === 'rest' || (mode === 'land' && sp < 130);
    if (settling) {
      dir += shortest(Math.PI / 2 - dir) * Math.min(1, dt * 5);
      bankA = lerp(bankA, 0, Math.min(1, dt * 5));
      pitchA = lerp(pitchA, 0, Math.min(1, dt * 4));      // lies flat on the page
    } else if (sp > 26) {
      const turn = shortest(Math.atan2(-vel.y, vel.x) - dir) * Math.min(1, dt * 7);
      dir += turn;                                        // screen y is down, 3d y is up
      bankA = lerp(bankA, clamp(-turn / Math.max(dt, 1e-3) * 0.10, -0.85, 0.85), Math.min(1, dt * 8));
      pitchA = lerp(pitchA, clamp(-0.16 - sp * 0.00035, -0.55, 0), Math.min(1, dt * 4));
    } else {
      bankA = lerp(bankA, 0, Math.min(1, dt * 4));
      pitchA = lerp(pitchA, 0, Math.min(1, dt * 3));
    }

    /* --- wings --- */
    if (mode === 'rest') {
      restT += dt;
      const breathe = 0.11 + Math.sin(restT * 1.15) * 0.055;
      const pulse = Math.max(0, Math.sin(restT * 0.82 - 1.1));
      flap = breathe + pulse * pulse * pulse * 0.95;      // a slow open-and-close now and then
    } else {
      const hz = (mode === 'land' ? 6.5 : 8.4 + scrollBoost * 3.2 + sp * 0.0035);
      flapPhase += dt * hz * Math.PI * 2;
      const amp = mode === 'land' ? 0.62 : 0.72 + Math.min(0.35, sp * 0.0007);
      const s = Math.sin(flapPhase);
      flap = 0.30 + (s >= 0 ? s : s * 0.72) * amp;        // down-stroke snaps, up-stroke eases
    }

    heading.rotation.z = dir - Math.PI / 2;               // model nose is +Y
    pitch.rotation.x = pitchA;
    bank.rotation.y = bankA;
    if (wingR) { wingR.rotation.y = -flap; wingL.rotation.y = flap; }

    canvas.style.transform = 'translate3d(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px,0)';
  }

  /* ---------- size ---------- */
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = 1;
    /* put the camera where a 1-unit wingspan measures SPAN_PX across the canvas */
    const span = Math.min(SPAN_PX, w * 0.34);
    const visible = h / span;                             // in model units
    camera.position.set(0, 0, (visible / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  /* ---------- load ---------- */
  function load(onReady, onFail) {
    const loader = new THREE.GLTFLoader();
    loader.load('/assets/butterfly.glb', onReady, null, onFail);
  }

  load(gltf => {
    if (disposed) return;
    const model = gltf.scene;
    wingR = model.getObjectByName('wingR');
    wingL = model.getObjectByName('wingL');
    if (!wingR || !wingL) return;
    model.traverse(o => {
      if (!o.isMesh) return;
      o.frustumCulled = false;
      if (o.material && o.material.transparent) o.material.depthWrite = false;
    });
    bank.add(model);
    ready = true;
    resize();
    renderer.setAnimationLoop(loop);
    canvas.classList.add('is-on');
  }, () => { if (!disposed) canvas.style.display = 'none'; });

  /* ---------- loop ---------- */
  let last = performance.now();
  on(window, 'resize', resize, {passive: true});
  on(document, 'visibilitychange', () => { last = performance.now(); });

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!ready || document.hidden || dt <= 0) return;
    fly(dt, now);
    renderer.render(scene, camera);
  }

  return () => {
    disposed = true;
    cleanups.forEach(fn => fn());
    renderer.setAnimationLoop(null);
    renderer.dispose();
    canvas.classList.remove('is-on');
  };
}
