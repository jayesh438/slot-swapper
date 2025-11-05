import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'' });
  const [error, setError] = useState('');

  const refresh = async () => {
    const evs = await api('/api/events');
    setEvents(evs);
  };

  useEffect(() => { refresh(); }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/events', { method:'POST', body: JSON.stringify({ ...form }) });
      setForm({ title:'', startTime:'', endTime:'' });
      await refresh();
    } catch (e) { setError(e.message); }
  };

  const updateStatus = async (id, status) => {
    await api(`/api/events/${id}`, { method:'PUT', body: JSON.stringify({ status }) });
    await refresh();
  };

  const remove = async (id) => {
    await api(`/api/events/${id}`, { method:'DELETE' });
    await refresh();
  };

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Create Event</h2>
        <form className="grid gap-2 max-w-xl" onSubmit={createEvent}>
          <input className="border p-2 rounded" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
          <label className="text-sm">Start Time</label>
          <input className="border p-2 rounded" type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} />
          <label className="text-sm">End Time</label>
          <input className="border p-2 rounded" type="datetime-local" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="px-3 py-2 border rounded w-fit">Add</button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">My Events</h2>
        <div className="grid gap-3">
          {events.map(ev => (
            <div key={ev._id} className="border p-3 rounded">
              <div className="font-medium">{ev.title}</div>
              <div className="text-sm">{new Date(ev.startTime).toLocaleString()} → {new Date(ev.endTime).toLocaleString()}</div>
              <div className="text-sm mb-2">Status: <span className="font-mono">{ev.status}</span></div>
              <div className="flex gap-2">
                <button className="px-2 py-1 border rounded" onClick={()=>updateStatus(ev._id, 'SWAPPABLE')}>Make Swappable</button>
                <button className="px-2 py-1 border rounded" onClick={()=>updateStatus(ev._id, 'BUSY')}>Set Busy</button>
                <button className="px-2 py-1 border rounded" onClick={()=>remove(ev._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
