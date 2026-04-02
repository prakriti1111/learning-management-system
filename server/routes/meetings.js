const express  = require('express');
const Meeting  = require('../models/Meeting');
const User     = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { createMeetingEvent, cancelMeetingEvent } = require('../services/googleCalendar');
const { sendMeetingSMS, sendMeetingEmail }        = require('../services/notificationService');

const router = express.Router();

router.post('/', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const { studentId, scheduledAt, durationMins = 30, type = 'google_meet', notes = '' } = req.body;

    const [teacher, student] = await Promise.all([
      User.findById(req.user.id),
      User.findById(studentId),
    ]);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const parent = student.parentId ? await User.findById(student.parentId) : null;
    if (!parent)  return res.status(404).json({ error: 'Parent not linked to this student' });

    let googleEventId = '', meetLink = '';
    if (type === 'google_meet' && process.env.GOOGLE_CLIENT_EMAIL) {
      try {
        const cal = await createMeetingEvent({ teacher, parent, student, scheduledAt: new Date(scheduledAt), durationMins, notes });
        googleEventId = cal.googleEventId;
        meetLink      = cal.meetLink;
      } catch (calErr) {
        console.warn('Google Calendar error (non-fatal):', calErr.message);
      }
    }

    const meeting = await Meeting.create({
      teacherId: teacher._id, studentId: student._id, parentId: parent._id,
      scheduledAt: new Date(scheduledAt), durationMins, type, notes, meetLink, googleEventId,
    });

    Promise.allSettled([
      parent.phone  ? sendMeetingSMS({ parentPhone: parent.phone, teacherName: teacher.name, studentName: student.name, scheduledAt: new Date(scheduledAt), meetLink }) : null,
      parent.email  ? sendMeetingEmail({ parentEmail: parent.email, parentName: parent.name, teacherName: teacher.name, studentName: student.name, scheduledAt: new Date(scheduledAt), meetLink, notes }) : null,
    ]).then(results => {
      Meeting.findByIdAndUpdate(meeting._id, {
        'notifications.smsSent':   results[0]?.status === 'fulfilled',
        'notifications.emailSent': results[1]?.status === 'fulfilled',
        'notifications.sentAt':    new Date(),
      }).exec();
    });

    res.status(201).json({ meeting, meetLink });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'teacher' ? { teacherId: req.user.id }
      : req.user.role === 'parent' ? { parentId: req.user.id }
      : req.user.role === 'admin'  ? {}
      : { studentId: req.user.id };

    const meetings = await Meeting.find(filter)
      .populate('studentId', 'name gradeLevel')
      .populate('teacherId', 'name email')
      .populate('parentId',  'name phone email')
      .sort({ scheduledAt: 1 });
    res.json(meetings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, requireRole('teacher','admin'), async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.googleEventId && process.env.GOOGLE_CLIENT_EMAIL) {
      try { await cancelMeetingEvent(meeting.googleEventId); } catch {}
    }
    meeting.status = 'cancelled';
    await meeting.save();
    res.json({ cancelled: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;