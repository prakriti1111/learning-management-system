const express = require('express');
const Lesson  = require('../models/Lesson');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.subject)    filter.subject    = req.query.subject;
    if (req.query.gradeLevel) filter.gradeLevel = parseInt(req.query.gradeLevel);
    if (req.query.difficulty) filter.difficulty = parseInt(req.query.difficulty);
    const lessons = await Lesson.find(filter).limit(50).sort({ difficulty: 1 });
    res.json(lessons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('skillNodeId');
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const lesson = await Lesson.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;