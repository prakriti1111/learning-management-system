
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text:      { type: String, default: '' },
  audioUrl:  { type: String, default: '' },
  imageUrl:  { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  subject:     { type: String, required: true, enum: ['math','science','hindi','english','evs'] },
  topic:       { type: String, required: true },
  subtopic:    { type: String, default: '' },
  gradeLevel:  { type: Number, required: true, min: 1, max: 6 },
  difficulty:  { type: Number, required: true, min: 1, max: 5 },
  contentType: { type: String, enum: ['mcq','audio_mcq','image_tap','fill_blank','true_false'], default: 'mcq' },

  question: {
    text:     { type: String, default: '' },
    audioUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },

  options:       [optionSchema],
  correctAnswer: { type: String, default: '' },
  explanation:   { type: String, default: '' },

  skillNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillNode', default: null },
  tags:        [{ type: String }],
  language:    { type: String, default: 'hi' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

lessonSchema.index({ subject: 1, gradeLevel: 1, difficulty: 1 });
lessonSchema.index({ isActive: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
