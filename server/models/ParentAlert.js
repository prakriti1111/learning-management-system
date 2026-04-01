
const mongoose = require('mongoose');

const parentAlertSchema = new mongoose.Schema({
  parentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekOf:    { type: Date, default: null },

  summary:     { type: String, default: '' },
  strongAreas: [{ type: String }],
  weakAreas:   [{ type: String }],
  tips:        [{ type: String }],
  achievements:[{ type: String }],

  sessionsThisWeek: { type: Number, default: 0 },
  avgScore:         { type: Number, default: 0 },

  read: { type: Boolean, default: false },
}, { timestamps: true });

parentAlertSchema.index({ parentId: 1, createdAt: -1 });

module.exports = mongoose.model('ParentAlert', parentAlertSchema);
