'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ShopContext = createContext(null);

const defaultShop = { bag: 0, bump: 0, say: () => {}, addToBag: () => {} };

export const useShop = () => useContext(ShopContext) || defaultShop;

/* ---------- bag + toast ---------- */
export default function ShopProvider({ children }) {
  const [bag, setBag] = useState(0);
  const [bump, setBump] = useState(0);
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef(null);

  const say = useCallback(msg => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2600);
  }, []);

  const addToBag = useCallback(title => {
    setBag(n => n + 1);
    setBump(n => n + 1);
    say(`Added ${title} to your bag`);
  }, [say]);

  const value = useMemo(() => ({ bag, bump, say, addToBag }), [bag, bump, say, addToBag]);

  return (
    <ShopContext.Provider value={value}>
      {children}
      <div className={`toast${toast.show ? ' show' : ''}`} id="toast" role="status" aria-live="polite">{toast.msg}</div>
    </ShopContext.Provider>
  );
}
