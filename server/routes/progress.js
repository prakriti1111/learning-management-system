const express   = require('express');
const Progress  = require('../models/Progress');
const Session   = require('../models/Session');
const User      = require('../models/User');
const { auth }  = require('../middleware/auth');
const { checkAndAwardAchievements } = require('../services/achievementService');

const router = express.Router();

router.post('/session/start', auth, async (req, res) => {
  try {
    const session = await Session.create({ studentId: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { lastActiveAt: new Date() });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/session/:id/end', auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { endedAt: new Date() }, { new: true });
    res.json(session);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/attempt', auth, async (req, res) => {
  try {
    const { lessonId, skillNodeId, correct, timeTakenMs, audioUsed, answer, sessionId } = req.body;
    const studentId = req.user.id;

    let prog = await Progress.findOne({ studentId, skillNodeId });
    if (!prog) prog = new Progress({ studentId, skillNodeId });
    prog.updateSM2(!!correct);
    prog.difficultyHistory.push(prog.difficulty);
    await prog.save();

    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, {
        $push: { lessonsAttempted: { lessonId, correct: !!correct, timeTakenMs, audioUsed, answer } },
        $inc:  { xpEarned: correct ? 10 : 2 },
      });
    }

    await User.findByIdAndUpdate(studentId, { $inc: { xp: correct ? 10 : 2 } });

    const newAchievements = await checkAndAwardAchievements(studentId);

    res.json({ progress: prog, newAchievements });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.user.id })
      .populate('skillNodeId', 'subject topic subtopic gradeLevel');
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:studentId', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .populate('skillNodeId', 'subject topic subtopic');
    res.json(progress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;