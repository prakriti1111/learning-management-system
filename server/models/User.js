const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role:     { type: String, enum: ['child','teacher','parent','admin'], required: true },

  // Google OAuth
  googleId: { type: String, default: null, sparse: true },

  phone:    { type: String, default: '' },
  language: { type: String, enum: ['hi','en','ta','te','bn'], default: 'hi' },
  avatar:   { type: String, default: '' },

  // child fields
  gradeLevel:   { type: Number, min: 1, max: 6 },
  classId:      { type: String, default: '' },
  schoolId:     { type: String, default: '' },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  xp:           { type: Number, default: 0 },
  streakDays:   { type: Number, default: 0 },
  lastActiveAt: { type: Date,   default: null },

  // parent fields
  linkedChildIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // teacher fields
  assignedClassIds: [{ type: String }],

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);