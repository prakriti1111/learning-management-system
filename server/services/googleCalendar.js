// ⚠️  API KEY NEEDED:
//   1. console.cloud.google.com → APIs & Services → Enable "Google Calendar API"
//   2. Credentials → Create Service Account → download JSON key
//   3. Share the teacher's Google Calendar with the service account email (give "Make changes to events" permission)
//   4. Copy GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY into your .env

const { google } = require('googleapis');

function getCalendar() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key:  (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

async function createMeetingEvent({ teacher, parent, student, scheduledAt, durationMins = 30, notes = '' }) {
  const calendar = getCalendar();
  const end = new Date(new Date(scheduledAt).getTime() + durationMins * 60000);

  const event = {
    summary:     `Parent meeting — ${student.name}`,
    description: notes || `Meeting by ${teacher.name} regarding ${student.name}'s progress.`,
    start: { dateTime: new Date(scheduledAt).toISOString(), timeZone: 'Asia/Kolkata' },
    end:   { dateTime: end.toISOString(),                   timeZone: 'Asia/Kolkata' },
    attendees: [
      { email: teacher.email, displayName: teacher.name },
      { email: parent.email,  displayName: parent.name  },
    ],
    conferenceData: {
      createRequest: {
        requestId: `lb-meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const res = await calendar.events.insert({
    calendarId:            'primary',
    resource:              event,
    conferenceDataVersion: 1,
    sendUpdates:           'all',
  });

  return {
    googleEventId: res.data.id,
    meetLink:      res.data.conferenceData?.entryPoints?.[0]?.uri || '',
  };
}

async function cancelMeetingEvent(googleEventId) {
  const calendar = getCalendar();
  await calendar.events.delete({
    calendarId:  'primary',
    eventId:     googleEventId,
    sendUpdates: 'all',
  });
}

module.exports = { createMeetingEvent, cancelMeetingEvent };
