'use client';
import { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { getViewCount } from '@/lib/store';

export default function ViewCounter({ requestId }) {
  const [count, setCount] = useState(0);
  const [changed, setChanged] = useState(false);
  // Held in a ref, not state: the polling closure below is created once per
  // requestId and would otherwise keep reading a stale count forever.
  const prev = useRef(null);

  useEffect(() => {
    prev.current = null;
    let highlight;

    const poll = () => {
      const next = getViewCount(requestId);
      if (prev.current !== null && next > prev.current) {
        setChanged(true);
        clearTimeout(highlight);
        highlight = setTimeout(() => setChanged(false), 2000);
      }
      prev.current = next;
      setCount(next);
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(highlight);
    };
  }, [requestId]);

  return (
    <div className="view-counter" style={changed ? { borderColor: 'var(--success-border)', animation: 'fadeIn .3s' } : {}}>
      <div className="view-eye">
        <Icon name="eye" />
      </div>
      <div className="view-info">
        <div className="view-count" style={changed ? { color: 'var(--success)' } : {}}>{count}</div>
        <div className="view-label">dépanneur{count !== 1 ? 's' : ''} ont vu votre demande</div>
      </div>
      {count > 0 && <div className="view-pulse" />}
    </div>
  );
}
