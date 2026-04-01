
const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  lessonId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  correct:     { type: Boolean, default: false },
  timeTakenMs: { type: Number,  default: 0 },
  audioUsed:   { type: Boolean, default: false },
  answer:      { type: String,  default: '' },
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  studentId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startedAt:        { type: Date, default: Date.now },
  endedAt:          { type: Date, default: null },
  lessonsAttempted: [attemptSchema],
  xpEarned:         { type: Number, default: 0 },
  streakDay:        { type: Number, default: 0 },
}, { timestamps: true });

sessionSchema.index({ studentId: 1, startedAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
