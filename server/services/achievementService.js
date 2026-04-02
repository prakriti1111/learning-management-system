const Achievement = require('../models/Achievement');
const Session     = require('../models/Session');
const Progress    = require('../models/Progress');
const User        = require('../models/User');

const XP = {
  first_lesson:50, streak_3:75, streak_7:150, streak_30:500,
  math_explorer:100, science_star:100, hindi_hero:100, english_ace:100,
  speed_reader:80, perfect_score:120, top_of_class:200, quiz_winner:200,
};

function getStreak(sessions) {
  if (!sessions.length) return 0;
  const sorted = [...sessions].sort((a,b) => new Date(b.startedAt)-new Date(a.startedAt));
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i-1].startedAt) - new Date(sorted[i].startedAt)) / 86400000;
    if (diff <= 1.5) streak++;
    else break;
  }
  return streak;
}

function masteredIn(subject, progressDocs) {
  return progressDocs.filter(p =>
    p.skillNodeId?.subject === subject && p.masteryScore >= 0.8
  ).length;
}

async function checkAndAwardAchievements(studentId) {
  const [sessions, progress] = await Promise.all([
    Session.find({ studentId }),
    Progress.find({ studentId }).populate('skillNodeId', 'subject'),
  ]);
  const streak = getStreak(sessions);
  const total  = sessions.length;

  const rules = [
    { type:'first_lesson',  check:() => total >= 1 },
    { type:'streak_3',      check:() => streak >= 3 },
    { type:'streak_7',      check:() => streak >= 7 },
    { type:'streak_30',     check:() => streak >= 30 },
    { type:'math_explorer', check:() => masteredIn('math',    progress) >= 5 },
    { type:'science_star',  check:() => masteredIn('science', progress) >= 5 },
    { type:'hindi_hero',    check:() => masteredIn('hindi',   progress) >= 5 },
    { type:'english_ace',   check:() => masteredIn('english', progress) >= 5 },
  ];

  const newOnes = [];
  for (const rule of rules) {
    const exists = await Achievement.findOne({ studentId, type: rule.type });
    if (!exists && rule.check()) {
      await Achievement.create({ studentId, type: rule.type, xpAwarded: XP[rule.type] || 50 });
      await User.findByIdAndUpdate(studentId, { $inc: { xp: XP[rule.type] || 50 } });
      newOnes.push(rule.type);
    }
  }
  return newOnes;
}

module.exports = { checkAndAwardAchievements };