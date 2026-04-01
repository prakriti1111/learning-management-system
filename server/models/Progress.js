
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  skillNodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillNode', required: true },

  masteryScore:     { type: Number, default: 0,   min: 0, max: 1 },
  totalAttempts:    { type: Number, default: 0 },
  correctStreak:    { type: Number, default: 0 },
  lastAttempted:    { type: Date,   default: null },
  nextReviewAt:     { type: Date,   default: Date.now },

  difficulty:       { type: Number, default: 1 },
  difficultyHistory:[{ type: Number }],

  sm2Interval:      { type: Number, default: 1   },
  sm2EaseFactor:    { type: Number, default: 2.5 },
}, { timestamps: true });

progressSchema.index({ studentId: 1, skillNodeId: 1 }, { unique: true });

// SM-2 algorithm update
progressSchema.methods.updateSM2 = function (correct) {
  const q = correct ? 4 : 1;
  this.sm2EaseFactor = Math.max(1.3,
    this.sm2EaseFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );
  if (!correct) {
    this.sm2Interval  = 1;
    this.correctStreak = 0;
  } else {
    this.correctStreak += 1;
    if      (this.sm2Interval === 1) this.sm2Interval = 3;
    else if (this.sm2Interval === 3) this.sm2Interval = 7;
    else this.sm2Interval = Math.round(this.sm2Interval * this.sm2EaseFactor);
  }
  this.masteryScore  = Math.min(1, Math.max(0, this.masteryScore + (correct ? 0.1 : -0.05)));
  this.nextReviewAt  = new Date(Date.now() + this.sm2Interval * 86400000);
  this.totalAttempts += 1;
  this.lastAttempted  = new Date();
};

module.exports = mongoose.model('Progress', progressSchema);