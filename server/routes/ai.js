const express  = require('express');
const Progress = require('../models/Progress');
const Lesson   = require('../models/Lesson');
const { auth } = require('../middleware/auth');
const { chatWithBuddy } = require('../services/aiService');

const router = express.Router();

router.post('/chat', auth, async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ reply: "Hi! I'm Buddy. I'm not fully set up yet — ask your teacher for help! 🙏" });
    }
    const reply = await chatWithBuddy({ messages: req.body.messages || [], language: req.user.language || 'hi' });
    res.json({ reply });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/recommend', auth, async (req, res) => {
  try {
    const studentId  = req.user.id;
    const gradeLevel = req.user.gradeLevel || 3;
    const now        = Date.now();

    const progressDocs = await Progress.find({ studentId }).populate('skillNodeId','subject topic');

    const due = progressDocs.filter(p => p.nextReviewAt && new Date(p.nextReviewAt).getTime() <= now);
    const zpd = progressDocs.filter(p => p.masteryScore >= 0.35 && p.masteryScore < 0.78);
    const target = due[0] || zpd[0] || null;
    const reason = due.length ? 'review' : zpd.length ? 'zpd' : 'new';

    let lesson = null;
    if (target) {
      const diff = target.masteryScore < 0.5 ? Math.max(1, target.difficulty - 1) : target.difficulty;
      lesson = await Lesson.findOne({ skillNodeId: target.skillNodeId?._id, difficulty: diff, isActive: true });
    }
    if (!lesson) {
      const doneIds = progressDocs.map(p => p.skillNodeId?._id).filter(Boolean);
      lesson = await Lesson.findOne({ gradeLevel, difficulty: 1, skillNodeId: { $nin: doneIds }, isActive: true })
            || await Lesson.findOne({ gradeLevel, isActive: true });
    }

    res.json({ lesson, reason, progressDoc: target });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/transcribe', auth, async (req, res) => {
  try {
    const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(`${aiUrl}/transcribe`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ audioBase64: req.body.audioBase64, language: req.body.language || req.user.language || 'hi' }),
    });
    if (!response.ok) throw new Error(`AI service responded with ${response.status}`);
    res.json(await response.json());
  } catch (err) {
    res.status(503).json({ error: 'Voice service unavailable. Please type your answer.', detail: err.message });
  }
});

module.exports = router;