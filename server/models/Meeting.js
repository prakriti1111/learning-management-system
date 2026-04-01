
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  scheduledAt:  { type: Date,   required: true },
  durationMins: { type: Number, default: 30 },
  type:         { type: String, enum: ['google_meet','in_person','phone'], default: 'google_meet' },

  meetLink:       { type: String, default: '' },
  googleEventId:  { type: String, default: '' },

  notes:  { type: String, default: '' },
  reason: { type: String, default: '' },

  status: { type: String, enum: ['scheduled','completed','cancelled'], default: 'scheduled' },

  notifications: {
    smsSent:   { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    sentAt:    { type: Date,    default: null  },
  },
}, { timestamps: true });

meetingSchema.index({ teacherId: 1, scheduledAt: 1 });
meetingSchema.index({ parentId:  1, scheduledAt: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
