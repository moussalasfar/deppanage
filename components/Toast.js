'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icons';

const ToastCtx = createContext(null);

export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exit: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 4000);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toast-box">
        {toasts.map(t => (
          <div key={t.id} className={`toast t-${t.type === 'success' ? 'ok' : t.type === 'error' ? 'err' : t.type === 'warning' ? 'warn' : 'info'} ${t.exit ? 'out' : ''}`}>
            <Icon name={t.type === 'success' ? 'check' : t.type === 'error' ? 'x' : t.type === 'warning' ? 'alert' : 'info'} />
            <span className="toast-msg">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
