const express     = require('express');
const User        = require('../models/User');
const ParentAlert = require('../models/ParentAlert');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/children', auth, requireRole('parent'), async (req, res) => {
  try {
    const children = await User.find({ parentId: req.user.id, isActive: true }).select('-password');
    res.json(children);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/alerts', auth, requireRole('parent'), async (req, res) => {
  try {
    const alerts = await ParentAlert.find({ parentId: req.user.id })
      .populate('childId', 'name gradeLevel xp streakDays')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(alerts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/alerts/:id/read', auth, requireRole('parent'), async (req, res) => {
  try {
    await ParentAlert.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;