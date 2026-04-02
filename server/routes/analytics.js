const express     = require('express');
const User        = require('../models/User');
const Session     = require('../models/Session');
const Progress    = require('../models/Progress');
const Achievement = require('../models/Achievement');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/class', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = { role: 'child', isActive: true };
    if (req.user.role === 'teacher') {
      filter.classId = classId || req.user.assignedClassIds?.[0] || '__none__';
    } else if (classId) {
      filter.classId = classId;
    }

    const students    = await User.find(filter);
    const studentIds  = students.map(s => s._id);
    const weekAgo     = new Date(Date.now() - 7 * 86400000);

    const sessions = await Session.find({ studentId: { $in: studentIds }, startedAt: { $gte: weekAgo } });

    const statsMap = {};
    students.forEach(s => {
      statsMap[s._id.toString()] = {
        student:          { _id: s._id, name: s.name, gradeLevel: s.gradeLevel, xp: s.xp, lastActiveAt: s.lastActiveAt },
        sessionsThisWeek: 0, totalCorrect: 0, totalAttempts: 0, avgScore: 0,
      };
    });

    sessions.forEach(sess => {
      const sid = sess.studentId.toString();
      if (!statsMap[sid]) return;
      statsMap[sid].sessionsThisWeek++;
      const attempts = sess.lessonsAttempted || [];
      statsMap[sid].totalAttempts += attempts.length;
      statsMap[sid].totalCorrect  += attempts.filter(a => a.correct).length;
    });

    Object.values(statsMap).forEach(s => {
      s.avgScore = s.totalAttempts ? Math.round((s.totalCorrect / s.totalAttempts) * 100) : 0;
    });

    const sorted       = Object.values(statsMap).sort((a,b) => b.avgScore - a.avgScore);
    const topPerformers= sorted.slice(0, 5);
    const needAttention= sorted.filter(s => s.avgScore < 50 || s.sessionsThisWeek === 0).slice(0, 6);

    res.json({ all: sorted, topPerformers, needAttention, totalStudents: students.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/student/:id', auth, async (req, res) => {
  try {
    const [student, progress, sessions, achievements] = await Promise.all([
      User.findById(req.params.id).select('-password'),
      Progress.find({ studentId: req.params.id }).populate('skillNodeId', 'subject topic'),
      Session.find({ studentId: req.params.id }).sort({ startedAt: -1 }).limit(30),
      Achievement.find({ studentId: req.params.id }),
    ]);

    const subjectMap = {};
    progress.forEach(p => {
      if (!p.skillNodeId) return;
      const sub = p.skillNodeId.subject;
      if (!subjectMap[sub]) subjectMap[sub] = [];
      subjectMap[sub].push(p.masteryScore);
    });
    const subjects = Object.entries(subjectMap).map(([name, arr]) => ({
      name,
      avgMastery: Math.round((arr.reduce((a,b)=>a+b,0) / arr.length) * 100),
    }));

    res.json({ student, progress, sessions, achievements, subjects });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = { role: 'child', isActive: true };
    if (classId) filter.classId = classId;

    const students = await User.find(filter).select('name xp gradeLevel classId').sort({ xp: -1 }).limit(20);

    const withBadges = await Promise.all(
      students.map(async (s, i) => ({
        rank:       i + 1,
        studentId:  s._id,
        name:       s.name,
        xp:         s.xp || 0,
        badgeCount: await Achievement.countDocuments({ studentId: s._id }),
      }))
    );
    res.json(withBadges);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;