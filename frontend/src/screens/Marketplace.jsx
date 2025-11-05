import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';

export default function Marketplace() {
  const [theirSlots, setTheirSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [offerFor, setOfferFor] = useState(null);

  const refresh = async () => {
    const theirs = await api('/api/swappable-slots');
    setTheirSlots(theirs);
    const mine = await api('/api/events');
    setMySlots(mine.filter(m => m.status === 'SWAPPABLE'));
  };
  useEffect(()=>{ refresh(); }, []);

  const requestSwap = async (theirSlotId, mySlotId) => {
    await api('/api/swap-request', { method:'POST', body: JSON.stringify({ theirSlotId, mySlotId }) });
    setOfferFor(null);
    await refresh();
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Marketplace</h2>
      <div className="grid gap-3">
        {theirSlots.map(s => (
          <div key={s._id} className="border p-3 rounded">
            <div className="font-medium">{s.title}</div>
            <div className="text-sm">{new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}</div>
            <div className="text-sm">Owner: {s.owner?.name || s.owner?.email}</div>
            <button className="px-2 py-1 border rounded mt-2" onClick={()=>setOfferFor(s._id)}>Request Swap</button>
            {offerFor === s._id && (
              <div className="mt-2 p-2 border rounded">
                <div className="text-sm mb-2">Choose one of your SWAPPABLE slots to offer:</div>
                <div className="grid gap-2">
                  {mySlots.length === 0 && <div className="text-sm">You have no swappable slots. Mark one in Dashboard.</div>}
                  {mySlots.map(m => (
                    <button key={m._id} className="px-2 py-1 border rounded text-left"
                      onClick={()=>requestSwap(s._id, m._id)}>
                      {m.title} — {new Date(m.startTime).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
