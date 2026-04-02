const express     = require('express');
const User        = require('../models/User');
const Lesson      = require('../models/Lesson');
const Session     = require('../models/Session');
const Progress    = require('../models/Progress');
const Achievement = require('../models/Achievement');
const Feedback    = require('../models/Feedback');
const Meeting     = require('../models/Meeting');
const { auth, requireRole } = require('../middleware/auth');

const router    = express.Router();
const adminOnly = [auth, requireRole('admin')];

router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const [totalStudents, totalTeachers, totalParents, totalLessons, totalMeetings] = await Promise.all([
      User.countDocuments({ role: 'child' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'parent' }),
      Lesson.countDocuments({ isActive: true }),
      Meeting.countDocuments({ status: 'scheduled' }),
    ]);
    const activeArr     = await Session.distinct('studentId', { startedAt: { $gte: weekAgo } });
    const subjectBreakdown = await Lesson.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const recentFeedback = await Feedback.find()
      .populate('userId', 'name role')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalStudents, totalTeachers, totalParents, totalLessons, totalMeetings,
      activeStudentsThisWeek: activeArr.length,
      subjectBreakdown, recentFeedback,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 })
        .skip((page - 1) * parseInt(limit)).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', ...adminOnly, async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ deactivated: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users/link-parent-child', ...adminOnly, async (req, res) => {
  try {
    const { parentId, childId } = req.body;
    if (!parentId || !childId) return res.status(400).json({ error: 'parentId and childId required' });
    await Promise.all([
      User.findByIdAndUpdate(childId,  { parentId }),
      User.findByIdAndUpdate(parentId, { $addToSet: { linkedChildIds: childId } }),
    ]);
    res.json({ linked: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users/assign-teacher', ...adminOnly, async (req, res) => {
  try {
    const { teacherId, classId, schoolId } = req.body;
    if (!teacherId || !classId) return res.status(400).json({ error: 'teacherId and classId required' });
    await User.findByIdAndUpdate(teacherId, { $addToSet: { assignedClassIds: classId } });
    if (schoolId) await User.updateMany({ role: 'child', classId }, { schoolId });
    res.json({ assigned: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/lessons', ...adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject)             filter.subject    = req.query.subject;
    if (req.query.gradeLevel)          filter.gradeLevel = parseInt(req.query.gradeLevel);
    if (req.query.isActive !== 'all' && req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    const lessons = await Lesson.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 }).limit(100);
    res.json(lessons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/lessons/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    lesson.isActive = !lesson.isActive;
    await lesson.save();
    res.json({ isActive: lesson.isActive });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/lessons/:id', ...adminOnly, async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/analytics', ...adminOnly, async (req, res) => {
  try {
    const [sessionsByDay, topStudents] = await Promise.all([
      Session.aggregate([
        { $match: { startedAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: {
          _id:      { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          count:    { $sum: 1 },
          xpTotal:  { $sum: '$xpEarned' },
        }},
        { $sort: { _id: 1 } },
      ]),
      User.find({ role: 'child', isActive: true }).sort({ xp: -1 }).limit(10).select('name xp gradeLevel'),
    ]);
    res.json({ sessionsByDay, topStudents });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/feedback', ...adminOnly, async (req, res) => {
  try {
    const fb = await Feedback.find().populate('userId', 'name role').sort({ createdAt: -1 }).limit(100);
    const avgRating = fb.length ? (fb.reduce((s,f) => s + f.rating, 0) / fb.length).toFixed(1) : '0.0';
    res.json({ feedback: fb, avgRating: parseFloat(avgRating), total: fb.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;