const User          = require('../models/User');
const Session       = require('../models/Session');
const Progress      = require('../models/Progress');
const Achievement   = require('../models/Achievement');
const ParentAlert   = require('../models/ParentAlert');
const { generateParentSummary }  = require('./aiService');
const { sendWeeklyReportEmail }  = require('./notificationService');

async function generateWeeklyParentReports() {
  console.log('[CRON] Generating weekly parent reports…');
  const students = await User.find({ role: 'child', isActive: true });

  for (const student of students) {
    try {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      const [sessions, progress, newAchievements, parent] = await Promise.all([
        Session.find({ studentId: student._id, startedAt: { $gte: weekAgo } }),
        Progress.find({ studentId: student._id }).populate('skillNodeId', 'subject'),
        Achievement.find({ studentId: student._id, unlockedAt: { $gte: weekAgo } }),
        User.findById(student.parentId),
      ]);
      if (!parent) continue;

      // Build subject scores
      const subjectMap = {};
      progress.forEach(p => {
        if (!p.skillNodeId) return;
        const s = p.skillNodeId.subject;
        if (!subjectMap[s]) subjectMap[s] = [];
        subjectMap[s].push(p.masteryScore);
      });
      const avgBySubject = {};
      Object.entries(subjectMap).forEach(([s, arr]) => {
        avgBySubject[s] = arr.reduce((a,b)=>a+b,0) / arr.length;
      });
      const sorted     = Object.entries(avgBySubject).sort((a,b)=>b[1]-a[1]);
      const strongAreas = sorted.filter(([,v])=>v>=0.65).map(([k])=>k);
      const weakAreas   = sorted.filter(([,v])=>v< 0.5).map(([k])=>k);

      const totalCorrect = sessions.reduce((sum,s)=>{
        const a = s.lessonsAttempted||[];
        return sum + a.filter(x=>x.correct).length;
      },0);
      const totalAttempts = sessions.reduce((s,x)=>s+(x.lessonsAttempted||[]).length,0);
      const avgScore = totalAttempts
        ? Math.round((totalCorrect/totalAttempts)*100) : 0;

      const aiResult = await generateParentSummary({
        childName:        student.name,
        age:              new Date().getFullYear() - (student.birthYear || 2016),
        gradeLevel:       student.gradeLevel || 3,
        strongAreas, weakAreas,
        sessionsThisWeek: sessions.length,
        avgScore,
        achievements:     newAchievements.map(a=>a.type),
        language:         student.language || 'en',
      });

      await ParentAlert.create({
        parentId:         parent._id,
        childId:          student._id,
        weekOf:           weekAgo,
        summary:          aiResult.summary || '',
        strongAreas, weakAreas,
        tips:             aiResult.tips || [],
        achievements:     newAchievements.map(a=>a.type),
        sessionsThisWeek: sessions.length,
        avgScore,
      });

      if (parent.email) {
        await sendWeeklyReportEmail({
          parentEmail:  parent.email,
          parentName:   parent.name,
          childName:    student.name,
          summary:      aiResult.summary || '',
          strongAreas, weakAreas,
          tips:         aiResult.tips || [],
          achievements: newAchievements.map(a=>a.type),
        });
      }
      console.log(`[CRON] ✅ Report for ${student.name}`);
    } catch (err) {
      console.error(`[CRON] ❌ Failed for ${student._id}:`, err.message);
    }
  }
  console.log('[CRON] Done.');
}

module.exports = { generateWeeklyParentReports };