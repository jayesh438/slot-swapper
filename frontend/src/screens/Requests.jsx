import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const refresh = async () => {
    const r = await api('/api/requests');
    setIncoming(r.incoming || []);
    setOutgoing(r.outgoing || []);
  };
  useEffect(()=>{ refresh(); }, []);

  const respond = async (id, accepted) => {
    await api(`/api/swap-response/${id}`, { method:'POST', body: JSON.stringify({ accepted }) });
    await refresh();
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-xl font-semibold">Requests</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Incoming</h3>
          <div className="grid gap-3">
            {incoming.map(r => (
              <div key={r._id} className="border p-3 rounded">
                <div className="text-sm">They offered: <b>{r.mySlot?.title}</b></div>
                <div className="text-sm">For your: <b>{r.theirSlot?.title}</b></div>
                <div className="flex gap-2 mt-2">
                  <button className="px-2 py-1 border rounded" onClick={()=>respond(r._id, true)}>Accept</button>
                  <button className="px-2 py-1 border rounded" onClick={()=>respond(r._id, false)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Outgoing</h3>
          <div className="grid gap-3">
            {outgoing.map(r => (
              <div key={r._id} className="border p-3 rounded">
                <div className="text-sm">You offered: <b>{r.mySlot?.title}</b></div>
                <div className="text-sm">For: <b>{r.theirSlot?.title}</b></div>
                <div className="text-sm mt-1">Status: <span className="font-mono">{r.status}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
