
const mongoose = require('mongoose');

const TYPES = [
  'first_lesson','streak_3','streak_7','streak_30',
  'math_explorer','science_star','hindi_hero','english_ace',
  'speed_reader','perfect_score','top_of_class','quiz_winner',
];

const achievementSchema = new mongoose.Schema({
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, enum: TYPES, required: true },
  unlockedAt:    { type: Date,    default: Date.now },
  shownToChild:  { type: Boolean, default: false },
  shownToParent: { type: Boolean, default: false },
  xpAwarded:     { type: Number,  default: 50 },
}, { timestamps: true });

achievementSchema.index({ studentId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
module.exports.ACHIEVEMENT_TYPES = TYPES;
