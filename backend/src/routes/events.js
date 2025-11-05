import { Router } from 'express';
import Event, { EVENT_STATUS } from '../models/Event.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
  res.json(events);
});

router.post('/', async (req, res) => {
  const { title, startTime, endTime, status } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ error: 'Missing fields' });
  const ev = await Event.create({ title, startTime, endTime, status: status || EVENT_STATUS.BUSY, owner: req.user.id });
  res.status(201).json(ev);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const event = await Event.findOne({ _id: id, owner: req.user.id });
  if (!event) return res.status(404).json({ error: 'Not found' });
  const { title, startTime, endTime, status } = req.body;
  if (title !== undefined) event.title = title;
  if (startTime !== undefined) event.startTime = startTime;
  if (endTime !== undefined) event.endTime = endTime;
  if (status !== undefined) event.status = status;
  await event.save();
  res.json(event);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const deleted = await Event.findOneAndDelete({ _id: id, owner: req.user.id });
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
