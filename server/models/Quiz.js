
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  subject:    { type: String, required: true, enum: ['math','science','hindi','english','evs'] },
  gradeLevel: { type: Number, required: true, min: 1, max: 6 },
  lessonIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  xpReward:   { type: Number, default: 150 },
  startsAt:   { type: Date, required: true },
  endsAt:     { type: Date, required: true },
  isActive:   { type: Boolean, default: true },

  participants: [{
    studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score:       { type: Number, default: 0 },
    completedAt: { type: Date,   default: null },
    _id: false,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
