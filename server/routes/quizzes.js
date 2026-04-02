const express = require('express');
const Quiz    = require('../models/Quiz');
const User    = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true, endsAt: { $gte: new Date() } })
      .sort({ startsAt: 1 });
    res.json(quizzes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $push: { participants: { studentId: req.user.id, score: score || 0, completedAt: new Date() } } },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    await User.findByIdAndUpdate(req.user.id, { $inc: { xp: quiz.xpReward || 0 } });
    res.json({ ok: true, xpEarned: quiz.xpReward });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;