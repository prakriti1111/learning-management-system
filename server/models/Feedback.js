
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:    { type: String, enum: ['child','parent','teacher'], required: true },
  rating:  { type: Number, min: 1, max: 5, required: true },
  tags:    [{ type: String }],
  message: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
