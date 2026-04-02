// ⚠️  API KEYS NEEDED:
//   Twilio:  twilio.com → Console → Account SID + Auth Token + buy a phone number
//   Gmail:   Gmail → Settings → Security → App Passwords → generate one

const twilio     = require('twilio');
const nodemailer = require('nodemailer');

function getSMSClient() {
  return twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

function getMailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendMeetingSMS({ parentPhone, teacherName, studentName, scheduledAt, meetLink }) {
  if (!process.env.TWILIO_SID || !parentPhone) return;
  const dateStr = new Date(scheduledAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short',
  });
  const body = meetLink
    ? `Dear Parent, ${teacherName} has scheduled a meeting about ${studentName} on ${dateStr}. Join: ${meetLink}`
    : `Dear Parent, ${teacherName} has scheduled an in-person meeting about ${studentName} on ${dateStr}.`;
  return getSMSClient().messages.create({ body, from: process.env.TWILIO_PHONE, to: parentPhone });
}

async function sendMeetingEmail({ parentEmail, parentName, teacherName, studentName, scheduledAt, meetLink, notes }) {
  if (!process.env.EMAIL_USER || !parentEmail) return;
  const dateStr = new Date(scheduledAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short',
  });
  const html = `
  <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
    <div style="background:#185FA5;border-radius:10px 10px 0 0;padding:18px 24px">
      <h2 style="color:#fff;margin:0;font-size:18px">Meeting scheduled — LearnBright</h2>
    </div>
    <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 10px 10px;padding:24px">
      <p>Dear <strong>${parentName}</strong>,</p>
      <p>${teacherName} has scheduled a meeting about <strong>${studentName}</strong>.</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:14px;margin:18px 0">
        <p><strong>Date & Time:</strong> ${dateStr}</p>
        <p><strong>Teacher:</strong> ${teacherName}</p>
        ${notes ? `<p><strong>Note:</strong> ${notes}</p>` : ''}
      </div>
      ${meetLink ? `<a href="${meetLink}" style="display:inline-block;background:#185FA5;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:500">Join Google Meet</a>` : ''}
      <p style="color:#888;font-size:13px;margin-top:16px">Please contact the school to reschedule if needed.</p>
    </div>
  </div>`;
  return getMailTransporter().sendMail({
    from:    `"${teacherName} via LearnBright" <${process.env.EMAIL_USER}>`,
    to:      parentEmail,
    subject: `Meeting for ${studentName} — ${dateStr}`,
    html,
  });
}

async function sendWeeklyReportEmail({ parentEmail, parentName, childName, summary, strongAreas, weakAreas, tips, achievements }) {
  if (!process.env.EMAIL_USER || !parentEmail) return;
  const html = `
  <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
    <div style="background:#534AB7;border-radius:10px 10px 0 0;padding:18px 24px">
      <h2 style="color:#fff;margin:0">Weekly report — ${childName}</h2>
    </div>
    <div style="border:1px solid #e0e0e0;border-top:none;border-radius:0 0 10px 10px;padding:24px">
      <p>Dear <strong>${parentName}</strong>,</p>
      <p style="line-height:1.7">${summary}</p>
      ${strongAreas?.length ? `<h3 style="color:#085041">Strong areas</h3><p>${strongAreas.join(', ')}</p>` : ''}
      ${weakAreas?.length   ? `<h3 style="color:#993C1D">Focus areas</h3><p>${weakAreas.join(', ')}</p>`   : ''}
      ${tips?.length ? `<h3>Tips for home</h3><ul>${tips.map(t=>`<li>${t}</li>`).join('')}</ul>` : ''}
      ${achievements?.length ? `<h3>Achievements</h3><p>${achievements.join(' · ')}</p>` : ''}
    </div>
  </div>`;
  return getMailTransporter().sendMail({
    from:    `"LearnBright" <${process.env.EMAIL_USER}>`,
    to:      parentEmail,
    subject: `${childName}'s weekly learning report`,
    html,
  });
}

module.exports = { sendMeetingSMS, sendMeetingEmail, sendWeeklyReportEmail };