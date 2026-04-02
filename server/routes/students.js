const express     = require('express');
const User        = require('../models/User');
const Achievement = require('../models/Achievement');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const filter = { role: 'child', isActive: true };
    if (req.query.classId) filter.classId = req.query.classId;
    const students = await User.find(filter).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/achievements', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ studentId: req.user.id }).sort({ unlockedAt: -1 });
    res.json(achievements);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/achievements/:id/seen', auth, async (req, res) => {
  try {
    await Achievement.findByIdAndUpdate(req.params.id, { shownToChild: true });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;