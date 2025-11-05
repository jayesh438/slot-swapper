import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Event, { EVENT_STATUS } from '../models/Event.js';
import SwapRequest, { SWAP_STATUS } from '../models/SwapRequest.js';

const router = Router();

router.use(authRequired);

// GET /api/swappable-slots - slots from other users that are SWAPPABLE
router.get('/swappable-slots', async (req, res) => {
  const slots = await Event.find({ owner: { $ne: req.user.id }, status: EVENT_STATUS.SWAPPABLE }).populate('owner', 'name email');
  res.json(slots);
});

// GET /api/requests - incoming and outgoing
router.get('/requests', async (req, res) => {
  const incoming = await SwapRequest.find({ recipient: req.user.id }).populate('mySlot theirSlot requester recipient', 'title startTime endTime status name email');
  const outgoing = await SwapRequest.find({ requester: req.user.id }).populate('mySlot theirSlot requester recipient', 'title startTime endTime status name email');
  res.json({ incoming, outgoing });
});

// POST /api/swap-request
// body: { mySlotId, theirSlotId }
router.post('/swap-request', async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId) return res.status(400).json({ error: 'Missing slot ids' });

  const mySlot = await Event.findOne({ _id: mySlotId, owner: req.user.id });
  const theirSlot = await Event.findById(theirSlotId).populate('owner');
  if (!mySlot || !theirSlot) return res.status(404).json({ error: 'Slot not found' });
  if (theirSlot.owner._id.toString() === req.user.id) return res.status(400).json({ error: 'Cannot swap with your own slot' });

  if (mySlot.status !== EVENT_STATUS.SWAPPABLE || theirSlot.status !== EVENT_STATUS.SWAPPABLE) {
    return res.status(400).json({ error: 'Both slots must be SWAPPABLE' });
  }

  // set both to SWAP_PENDING
  mySlot.status = EVENT_STATUS.SWAP_PENDING;
  theirSlot.status = EVENT_STATUS.SWAP_PENDING;
  await mySlot.save();
  await theirSlot.save();

  const swap = await SwapRequest.create({
    mySlot: mySlot._id,
    theirSlot: theirSlot._id,
    requester: req.user.id,
    recipient: theirSlot.owner._id
  });

  res.status(201).json(swap);
});

// POST /api/swap-response/:requestId
// body: { accepted: boolean }
router.post('/swap-response/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const { accepted } = req.body;

  const swap = await SwapRequest.findById(requestId).populate('mySlot').populate('theirSlot');
  if (!swap) return res.status(404).json({ error: 'Request not found' });
  if (swap.recipient.toString() !== req.user.id) return res.status(403).json({ error: 'Not your incoming request' });
  if (swap.status !== SWAP_STATUS.PENDING) return res.status(400).json({ error: 'Already resolved' });

  const mySlot = await Event.findById(swap.mySlot._id);
  const theirSlot = await Event.findById(swap.theirSlot._id);

  if (accepted) {
    // verify still pending and valid
    if (mySlot.status !== EVENT_STATUS.SWAP_PENDING || theirSlot.status !== EVENT_STATUS.SWAP_PENDING) {
      return res.status(400).json({ error: 'Slots are not pending anymore' });
    }
    // transactional-ish swap (single doc updates; Mongo transactions omitted for simplicity)
    const tmpOwner = mySlot.owner;
    mySlot.owner = theirSlot.owner;
    theirSlot.owner = tmpOwner;
    mySlot.status = EVENT_STATUS.BUSY;
    theirSlot.status = EVENT_STATUS.BUSY;
    await mySlot.save();
    await theirSlot.save();
    swap.status = SWAP_STATUS.ACCEPTED;
    await swap.save();
    return res.json({ ok: true, status: SWAP_STATUS.ACCEPTED });
  } else {
    // revert both to SWAPPABLE
    mySlot.status = EVENT_STATUS.SWAPPABLE;
    theirSlot.status = EVENT_STATUS.SWAPPABLE;
    await mySlot.save();
    await theirSlot.save();
    swap.status = SWAP_STATUS.REJECTED;
    await swap.save();
    return res.json({ ok: true, status: SWAP_STATUS.REJECTED });
  }
});

export default router;
