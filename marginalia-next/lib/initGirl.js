/*
  The girl in the hero is the rigged girl.glb doll.

  The file ships with a Mixamo skeleton but no usable clip - its only "animation"
  is a two-key T-pose - so every gesture below is posed procedurally on the bones:
  she rises into frame, turns to face the visitor, tilts her head and waves on
  arrival, keeps breathing and watching the cursor, and waves again whenever you
  hover her.

  It shipped without face blend shapes too, so build-model.py bakes one in: a
  "smile" morph that pulls the mouth corners up and out, bows the lip line and
  lifts the cheeks. cur.smile drives its influence, and the greet and hover
  timelines take it to 1 for the length of the wave - she grins while waving and
  eases back to a resting 0.08 afterwards.

  If WebGL is missing, the model fails to load, or the visitor prefers reduced
  motion, assets/girl.png and the original CSS animation stay exactly as they were.

  Returns a cleanup function so the React component can tear everything down.
*/
export default function initGirl({ canvas, stage, wrapper, hero }) {
  const THREE = window.THREE;
  const noop = () => {};
  if (!canvas || !stage || !wrapper || !THREE || !THREE.GLTFLoader) return noop;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let disposed = false;
  const cleanups = [];
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  /* the handle the rest of the page talks to */
  const api = window.heroCharacter = {
    active: false,
    greet(){},
    wave(){}
  };
  const release = () => { if (window.heroCharacter === api) window.heroCharacter = undefined; };

  /* ---------- renderer ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  } catch (e) { return release; }               // no WebGL -> keep the PNG
  if (!renderer.getContext()) return release;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.97;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 40);

  /* soft, warm bookshop light to match the ivory / mauve palette */
  scene.add(new THREE.HemisphereLight(0xfff4f5, 0xd9b6bd, 0.62));
  /* the key sits low so her raised hand does not burn out during the wave */
  const key = new THREE.DirectionalLight(0xfff3e8, 1.15);   key.position.set(1.3, 1.45, 2.4);
  const fill = new THREE.DirectionalLight(0xf7dbe1, 0.5);   fill.position.set(-2.0, 0.9, 1.4);
  const rim  = new THREE.DirectionalLight(0xffffff, 0.4);   rim.position.set(-0.9, 1.8, -2.2);
  scene.add(key, fill, rim);

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  } catch (e) { /* environment is a nicety, not a requirement */ }

  const group = new THREE.Group();              // body offset / turn / bounce live here
  scene.add(group);

  /* ---------- framing ----------
     Measured off the skeleton, not off a bounding box: a skinned mesh's geometry
     box is in bind space and lies about where the character actually is. */
  const FRAME = {
    bottom: 0.30,   // world y at the bottom of the shot (upper thigh)
    top:    1.05,   // world y at the top of the shot (just above the head)
    centerX: 0,
    lift:   0.05    // camera sits a touch above the focus point
  };
  let model = null, smileMesh = null, smileIdx = -1;

  function frameCamera() {
    const h = FRAME.top - FRAME.bottom;
    const focus = (FRAME.top + FRAME.bottom) / 2;
    const dist = (h / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(FRAME.centerX, focus + FRAME.lift, dist);
    camera.lookAt(FRAME.centerX, focus, 0);
  }

  /* head-to-toe measured from the bones themselves */
  function measure() {
    const v = new THREE.Vector3();
    const top = B.HeadTop || B.Head, foot = B.LeftToeBase || B.LeftFoot || B.Hips;
    if (!top || !foot) return;
    model.updateMatrixWorld(true);
    top.getWorldPosition(v); let topY = v.y;
    foot.getWorldPosition(v); const footY = v.y;
    if (B.Hips) { B.Hips.getWorldPosition(v); FRAME.centerX = v.x; }
    if (!B.HeadTop) topY += (topY - footY) * 0.14;   // no crown bone: allow for the skull
    const height = Math.max(0.01, topY - footY);
    FRAME.bottom = footY + height * 0.315;   // cuts just above the knee
    FRAME.top    = topY  + height * 0.075;   // a little air over her head
  }

  function resize() {
    if (disposed) return;
    const w = Math.max(1, canvas.clientWidth  || Math.round(stage.clientWidth * 1.08));
    const h = Math.max(1, canvas.clientHeight || Math.round(stage.clientHeight * 1.13));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    frameCamera();
    if (api.active && reduce) renderer.render(scene, camera);   // no loop running
  }

  /* ---------- bones ---------- */
  const NAMES = ['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End',
                 'LeftShoulder','LeftArm','LeftForeArm','LeftHand','LeftToeBase','LeftFoot',
                 'RightShoulder','RightArm','RightForeArm','RightHand'];
  const B = {}, REST = {};

  function collectBones(root) {
    const bones = [];
    root.traverse(o => { if (o.isBone) bones.push(o); });
    const flat = n => n.replace(/[^a-z0-9]/gi, '').toLowerCase();
    NAMES.forEach(name => {
      const want = flat('mixamorig' + name);
      const b = bones.find(o => flat(o.name) === want) ||
                bones.find(o => flat(o.name).endsWith(flat(name)));
      if (b) { B[name] = b; REST[name] = b.quaternion.clone(); }
    });
    B.HeadTop = B['HeadTop_End'];
    return !!(B.RightArm && B.RightForeArm && B.Head);
  }

  /* Pose a bone by rotating it around WORLD axes on top of its bind pose, so the
     numbers below stay readable no matter how the rig's local axes are oriented.
     Order applied to the bone: X (nod) -> Y (turn) -> Z (roll/lift).
     `twist` spins the bone around its own axis (Mixamo bones run along local +Y). */
  const AX = new THREE.Vector3(1,0,0), AY = new THREE.Vector3(0,1,0), AZ = new THREE.Vector3(0,0,1);
  const _w = new THREE.Quaternion(), _t = new THREE.Quaternion(), _p = new THREE.Quaternion();

  function poseBone(bone, rest, rx, ry, rz, twist) {
    if (!bone) return;
    _w.identity();
    if (rz) _w.multiply(_t.setFromAxisAngle(AZ, rz));
    if (ry) _w.multiply(_t.setFromAxisAngle(AY, ry));
    if (rx) _w.multiply(_t.setFromAxisAngle(AX, rx));
    bone.parent.updateWorldMatrix(true, false);
    bone.parent.getWorldQuaternion(_p);
    bone.quaternion.copy(_p).invert().multiply(_w).multiply(_p).multiply(rest);
    if (twist) bone.quaternion.multiply(_t.setFromAxisAngle(AY, twist));
  }

  /* ---------- pose parameters ---------- */
  /* standing rest: arms lowered out of the imported T-pose and brought forward a
     little, head tilted just enough to read as friendly rather than blank */
  const IDLE = {
    rArmZ: 1.26, rArmY: 0.22, rForeZ: 0.12, rForeY: 0.14, rForeTwist: 0, rHandZ: 0,
    lArmZ:-1.26, lArmY:-0.22, lForeZ:-0.12, lForeY:-0.14,
    spineX: 0, spineY: 0, spineZ: 0,
    headX: 0, headY: 0, headZ: 0.05,
    bodyY: 0, bodyRotY: 0,
    smile: 0.08                                 // resting warmth; 1 = the wide grin
  };
  /* right arm up beside the head, palm turned to the visitor */
  const WAVE = {
    rArmZ: -0.46, rArmY: 0.34, rForeZ: -1.06, rForeY: 0.06, rForeTwist: 1.45, rHandZ: -0.10
  };

  const cur = Object.assign({}, IDLE);
  const tgt = Object.assign({}, IDLE);
  let waveAmp = 0, waveOsc = 0, handOsc = 0;

  const mix  = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ramp = (t, a, b) => { const u = clamp01((t - a) / (b - a)); return u * u * (3 - 2 * u); };

  /* ---------- gestures ---------- */
  const gesture = {kind: null, t: 0, dur: 0};
  let lastGestureEnd = -10, elapsed = 0;

  function play(kind) {
    if (!api.active || reduce) return;
    if (gesture.kind) return;                                   // already greeting
    if (elapsed - lastGestureEnd < 0.7) return;                 // small cooldown
    gesture.kind = kind;
    gesture.t = 0;
    gesture.dur = kind === 'greet' ? 4.6 : 2.9;
  }
  api.greet = () => play('greet');
  api.wave  = () => play('wave');

  const pointer = {x: 0, y: 0, tx: 0, ty: 0};

  function buildTargets(dt) {
    Object.assign(tgt, IDLE);

    /* --- always-on idle life: breathing, weight shift, watching the cursor --- */
    tgt.spineX  += Math.sin(elapsed * 1.25) * 0.014;            // breath
    tgt.bodyY   += Math.sin(elapsed * 1.25) * 0.004;
    tgt.bodyRotY+= Math.sin(elapsed * 0.42) * 0.035;            // slow sway
    tgt.headZ   += Math.sin(elapsed * 0.55) * 0.02;

    tgt.headY   += pointer.x * 0.34;                            // look at the visitor
    tgt.headX   += pointer.y * 0.20;
    tgt.spineY  += pointer.x * 0.10;
    tgt.spineX  += pointer.y * 0.04;

    /* --- scripted greeting / wave --- */
    let raise = 0;
    if (gesture.kind) {
      const T = gesture.t;
      if (gesture.kind === 'greet') {
        /* 0.0-0.9s  she rises into frame and turns from a 3/4 view to face you */
        const turn = 1 - ramp(T, 0.0, 0.95);
        tgt.bodyRotY += -0.45 * turn;
        tgt.bodyY    += -0.05 * turn;
        tgt.headY    +=  0.18 * turn;
        /* 0.45s  the "she noticed you" beat: chin up, warm head tilt */
        const smile = ramp(T, 0.45, 1.0) - ramp(T, 3.7, 4.6);
        tgt.headZ += 0.14 * smile;
        tgt.headX -= 0.08 * smile;
        tgt.spineX -= 0.03 * smile;
        tgt.smile = mix(IDLE.smile, 1, smile);            // grins through the wave
        /* 0.7-3.3s  the wave itself */
        raise = ramp(T, 0.70, 1.20) - ramp(T, 2.90, 3.40);
        waveAmp = ramp(T, 1.05, 1.35) - ramp(T, 2.70, 3.05);
        /* two little hops of delight underneath the wave */
        tgt.bodyY += 0.014 * raise * Math.max(0, Math.sin((T - 1.0) * Math.PI * 1.9));
        /* 3.5s  a closing nod, then back to idle */
        const nod = ramp(T, 3.45, 3.70) - ramp(T, 3.70, 4.15);
        tgt.headX += 0.11 * nod;
      } else {
        const smile = ramp(T, 0.05, 0.5) - ramp(T, 2.1, 2.9);
        tgt.headZ += 0.13 * smile;
        tgt.headX -= 0.07 * smile;
        tgt.headY += 0.10 * smile;
        tgt.smile = mix(IDLE.smile, 1, smile);
        raise = ramp(T, 0.05, 0.55) - ramp(T, 1.85, 2.35);
        waveAmp = ramp(T, 0.40, 0.70) - ramp(T, 1.70, 2.05);
        tgt.bodyY += 0.012 * raise * Math.max(0, Math.sin((T - 0.35) * Math.PI * 1.9));
      }

      gesture.t += dt;
      if (gesture.t >= gesture.dur) { gesture.kind = null; lastGestureEnd = elapsed; waveAmp = 0; }
    } else {
      waveAmp = 0;
    }

    if (raise > 0) {
      tgt.rArmZ      = mix(tgt.rArmZ,  WAVE.rArmZ,  raise);
      tgt.rArmY      = mix(tgt.rArmY,  WAVE.rArmY,  raise);
      tgt.rForeZ     = mix(tgt.rForeZ, WAVE.rForeZ, raise);
      tgt.rForeY     = mix(tgt.rForeY, WAVE.rForeY, raise);
      tgt.rForeTwist = mix(0,          WAVE.rForeTwist, raise);
      tgt.rHandZ     = mix(tgt.rHandZ, WAVE.rHandZ, raise);
      tgt.spineZ    += -0.055 * raise;                          // counter-lean
      tgt.headZ     +=  0.05 * raise;
      tgt.lArmZ     += -0.05 * raise;
    }
  }

  function damp(dt) {
    const k = 1 - Math.exp(-dt * 11);
    for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k;
  }

  function applyPose() {
    /* hand wave swings the forearm and flicks the wrist a beat later */
    const phase = elapsed * Math.PI * 2 * 2.15;
    waveOsc = Math.sin(phase) * 0.30 * waveAmp;
    handOsc = Math.sin(phase - 0.7) * 0.24 * waveAmp;

    const sx = cur.spineX / 3, sy = cur.spineY / 3, sz = cur.spineZ / 3;
    poseBone(B.Spine,  REST.Spine,  sx, sy, sz, 0);
    poseBone(B.Spine1, REST.Spine1, sx, sy, sz, 0);
    poseBone(B.Spine2, REST.Spine2, sx, sy, sz, 0);
    poseBone(B.Neck,   REST.Neck,   cur.headX * 0.35, cur.headY * 0.35, cur.headZ * 0.35, 0);
    poseBone(B.Head,   REST.Head,   cur.headX * 0.65, cur.headY * 0.65, cur.headZ * 0.65, 0);

    poseBone(B.RightArm,     REST.RightArm,     0, cur.rArmY,  cur.rArmZ, 0);
    poseBone(B.RightForeArm, REST.RightForeArm, 0, cur.rForeY, cur.rForeZ + waveOsc, cur.rForeTwist);
    poseBone(B.RightHand,    REST.RightHand,    0, 0,          cur.rHandZ + handOsc, 0);
    poseBone(B.LeftArm,      REST.LeftArm,      0, cur.lArmY,  cur.lArmZ, 0);
    poseBone(B.LeftForeArm,  REST.LeftForeArm,  0, cur.lForeY, cur.lForeZ, 0);

    if (smileIdx >= 0) smileMesh.morphTargetInfluences[smileIdx] = clamp01(cur.smile);

    group.position.y = cur.bodyY;
    group.rotation.y = cur.bodyRotY;
  }

  /* ---------- loading ---------- */
  function loadModel(onReady, onFail) {
    const loader = new THREE.GLTFLoader();
    loader.load('/assets/girl.glb', onReady, null, onFail);
  }

  loadModel(gltf => {
    if (disposed) return;
    model = gltf.scene;
    model.traverse(o => {
      if (o.isMesh) {
        o.frustumCulled = false;                 // procedural posing outruns the bind box
        o.castShadow = o.receiveShadow = false;
        /* the wide smile baked into girl.glb by build-model.py */
        if (o.morphTargetDictionary && 'smile' in o.morphTargetDictionary) {
          smileMesh = o; smileIdx = o.morphTargetDictionary.smile;
        }
        const m = o.material;
        if (m) {
          m.metalness = 0;
          m.roughness = Math.min(m.roughness ?? 0.6, 0.72);
          /* the export ships specularColorFactor 2.0, which blows the skin out */
          if (m.specularColor) m.specularColor.setScalar(0.85);
          m.needsUpdate = true;
        }
      }
    });
    group.add(model);
    model.updateMatrixWorld(true);

    if (!collectBones(model)) { renderer.dispose(); return; }   // unexpected rig -> keep the PNG

    measure();

    api.active = true;
    stage.classList.add('is-3d');
    wrapper.classList.add('is-3d');
    resize();

    if (reduce) {                                 // one friendly still frame, no loop
      buildTargets(0); Object.assign(cur, tgt); cur.smile = 0.7; applyPose();
      renderer.render(scene, camera);
      return;
    }
    Object.assign(cur, tgt, IDLE);
    renderer.setAnimationLoop(loop);
    const greetTimer = setTimeout(() => api.greet(), 320);   // welcome on arrival / on every refresh
    cleanups.push(() => clearTimeout(greetTimer));
  }, () => { /* leave the PNG and its CSS animation in place */ });

  /* ---------- loop ---------- */
  let last = performance.now(), visible = true;
  function step(dt) {
    elapsed += dt;
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 4));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 4));
    buildTargets(dt);
    damp(dt);
    applyPose();
    renderer.render(scene, camera);
  }
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    step(dt);
  }

  /* ---------- interaction ---------- */
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    cleanups.push(() => ro.disconnect());
  } else {
    on(window, 'resize', resize);
  }

  const vis = new IntersectionObserver(e => { visible = e[0].isIntersecting; }, {threshold: 0});
  vis.observe(stage);
  cleanups.push(() => vis.disconnect());
  on(document, 'visibilitychange', () => { last = performance.now(); });

  on(hero || document, 'pointermove', e => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    pointer.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
    pointer.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.42)) / (r.height * 0.9)));
  }, {passive: true});

  on(hero || document, 'pointerleave', () => { pointer.tx = 0; pointer.ty = 0; }, {passive: true});

  /* hovering her waves again */
  on(wrapper, 'pointerenter', () => api.wave());
  on(canvas, 'click', () => api.wave());

  return () => {
    disposed = true;
    cleanups.forEach(fn => fn());
    renderer.setAnimationLoop(null);
    renderer.dispose();
    stage.classList.remove('is-3d');
    wrapper.classList.remove('is-3d');
    release();
  };
}
