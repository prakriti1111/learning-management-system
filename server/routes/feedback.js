const express  = require('express');
const Feedback = require('../models/Feedback');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const fb = await Feedback.create({
      userId:  req.user.id,
      role:    req.user.role === 'child' ? 'child' : req.user.role === 'teacher' ? 'teacher' : 'parent',
      rating:  req.body.rating,
      tags:    req.body.tags  || [],
      message: req.body.message || '',
    });
    res.status(201).json(fb);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const fb = await Feedback.find()
      .populate('userId', 'name role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(fb);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;