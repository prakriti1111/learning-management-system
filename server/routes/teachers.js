const express = require('express');
const User    = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, requireRole('teacher'), (req, res) => res.json(req.user));

router.patch('/profile', auth, requireRole('teacher'), async (req, res) => {
  try {
    const allowed = ['name','phone','language','assignedClassIds'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;