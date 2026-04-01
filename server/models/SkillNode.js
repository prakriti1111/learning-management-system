
const mongoose = require('mongoose');

const skillNodeSchema = new mongoose.Schema({
  subject:         { type: String, required: true, enum: ['math','science','hindi','english','evs'] },
  topic:           { type: String, required: true },
  subtopic:        { type: String, default: '' },
  gradeLevel:      { type: Number, required: true, min: 1, max: 6 },
  prerequisiteIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillNode' }],
  description:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SkillNode', skillNodeSchema);