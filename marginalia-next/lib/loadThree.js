/*
  three.js and its two example add-ons are the same classic (non-module) builds the
  original page used, served from public/assets/vendor. They are loaded once, in
  order, and attach themselves to window.THREE. A script that fails to load simply
  leaves its global undefined, and the callers check for that exactly as before.
*/
const VENDOR = [
  '/assets/vendor/three.min.js',
  '/assets/vendor/GLTFLoader.js',
  '/assets/vendor/RoomEnvironment.js',
];

let pending = null;

function inject(src) {
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

export function loadThree() {
  if (!pending) pending = VENDOR.reduce((p, src) => p.then(() => inject(src)), Promise.resolve());
  return pending;
}
