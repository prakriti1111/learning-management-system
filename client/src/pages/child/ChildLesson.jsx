import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';
import { useAdaptiveLesson } from '../../hooks/useAdaptiveLesson';
import { useVoiceInput }     from '../../hooks/useVoiceInput';

export default function ChildLesson() {
  const navigate  = useNavigate();
  const startTime = useRef(Date.now());
  const { lesson, reason, loading, submitAttempt, endSession } = useAdaptiveLesson();
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct,   setCorrect]   = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [xpGained,  setXpGained]  = useState(0);
  const [answer,    setAnswer]    = useState('');
  const { recording, transcript, error: voiceError, startRecording, stopRecording } = useVoiceInput({
    language: 'hi',
    onTranscript: t => setAnswer(t),
  });

  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const isCorrect = lesson.contentType === 'fill_blank'
      ? answer.trim().toLowerCase() === (lesson.correctAnswer || '').toLowerCase()
      : selected !== null && lesson.options?.[selected]?.isCorrect === true;
    setCorrect(isCorrect);
    try {
      const result = await submitAttempt({
        correct: isCorrect,
        timeTakenMs: Date.now() - startTime.current,
        audioUsed: !!transcript,
        answer: lesson.contentType === 'fill_blank' ? answer : (lesson.options?.[selected]?.text || ''),
      });
      if (result?.newAchievements?.length) setNewBadges(result.newAchievements);
      setXpGained(isCorrect ? 10 : 2);
    } catch (e) { console.error(e); }
    startTime.current = Date.now();
  }

  function handleNext() {
    setSelected(null); setSubmitted(false); setCorrect(null);
    setAnswer(''); setNewBadges([]);
  }

  if (loading || !lesson) return (
    <div className="app-layout"><NavBar />
      <main className="app-content">
        <div className="loading">{loading ? 'Loading lesson…' : 'No lesson available. Ask your teacher to add content!'}</div>
      </main>
    </div>
  );

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page" style={{maxWidth:600}}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button className="btn btn-ghost btn-sm" onClick={() => { endSession(); navigate('/child'); }}>← Back</button>
          <span className="badge badge-teal capitalize">{lesson.subject}</span>
          <span className="text-xs text-gray-400 font-semibold">Level {lesson.difficulty}</span>
          {reason === 'review' && <span className="badge badge-amber">Review</span>}
        </div>

        {/* Question card */}
        <div className="card mb-5">
          {lesson.question?.imageUrl && (
            <img src={lesson.question.imageUrl} alt="question" className="w-full rounded-xl mb-4 object-cover max-h-48" />
          )}
          {lesson.question?.audioUrl && (
            <audio controls src={lesson.question.audioUrl} className="w-full mb-4" />
          )}
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-relaxed mb-5" style={{fontFamily:'Nunito,sans-serif'}}>
            {lesson.question?.text || 'No question text available.'}
          </p>

          {/* MCQ */}
          {(lesson.contentType === 'mcq' || lesson.contentType === 'audio_mcq') && (
            <div className="flex flex-col gap-2.5">
              {(lesson.options || []).map((opt, i) => {
                let cls = 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700';
                if (submitted) {
                  if (opt.isCorrect)       cls = 'bg-[#E1F5EE] dark:bg-[#085041]/20 border-[#5DCAA5] text-[#085041] dark:text-[#5DCAA5]';
                  else if (i === selected) cls = 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400';
                } else if (i === selected) cls = 'bg-[#E6F1FB] dark:bg-[#185FA5]/20 border-[#378ADD] text-[#185FA5] dark:text-[#85B7EB]';
                return (
                  <button key={i} onClick={() => !submitted && setSelected(i)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${cls} ${!submitted ? 'cursor-pointer' : 'cursor-default'}`}>
                    {opt.audioUrl && <audio src={opt.audioUrl} controls className="block mb-2 w-full" onClick={e => e.stopPropagation()} />}
                    <span className="inline-flex w-6 h-6 rounded-full bg-white/60 dark:bg-white/10 items-center justify-center text-xs font-black mr-2 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt.text}
                    {submitted && opt.isCorrect && ' ✓'}
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill blank */}
          {lesson.contentType === 'fill_blank' && (
            <div className="flex flex-col gap-2">
              <input className="input text-base" value={answer} disabled={submitted}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !submitted && handleSubmit()}
                placeholder="Type your answer…" />
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={recording ? stopRecording : startRecording} disabled={submitted}
                  className={`btn btn-sm ${recording ? 'btn-coral' : 'btn-ghost'}`}>
                  {recording ? '⏹ Stop' : '🎤 Speak'}
                </button>
                {transcript && <span className="text-xs text-gray-500 dark:text-gray-400">Heard: "{transcript}"</span>}
                {voiceError  && <span className="text-xs text-red-500">{voiceError}</span>}
              </div>
            </div>
          )}

          {/* True/False */}
          {lesson.contentType === 'true_false' && (
            <div className="flex gap-3">
              {['True','False'].map((opt, i) => {
                const isCorrectOpt = (opt === 'True' && lesson.correctAnswer === 'true') ||
                                     (opt === 'False' && lesson.correctAnswer === 'false');
                let cls = 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
                if (submitted) {
                  if (isCorrectOpt) cls = 'bg-[#E1F5EE] dark:bg-[#085041]/20 border-[#5DCAA5] text-[#085041] dark:text-[#5DCAA5]';
                  else if (selected === i) cls = 'bg-red-50 dark:bg-red-900/20 border-red-300 text-red-700';
                } else if (selected === i) cls = 'bg-[#E6F1FB] dark:bg-[#185FA5]/20 border-[#378ADD] text-[#185FA5]';
                return (
                  <button key={opt} onClick={() => !submitted && setSelected(i)}
                    className={`flex-1 py-4 rounded-xl border-2 text-base font-black transition-all ${cls} ${!submitted ? 'cursor-pointer' : 'cursor-default'}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Result */}
        {submitted && (
          <div className={`rounded-2xl p-4 mb-5 border-2 animate-fade-up ${correct ? 'bg-[#E1F5EE] dark:bg-[#085041]/15 border-[#5DCAA5]' : 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-800'}`}>
            <p className={`font-black text-base mb-1 ${correct ? 'text-[#085041] dark:text-[#5DCAA5]' : 'text-red-700 dark:text-red-400'}`} style={{fontFamily:'Nunito,sans-serif'}}>
              {correct ? '🎉 Correct! Great job!' : '❌ Not quite — keep trying!'}
            </p>
            {lesson.explanation && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lesson.explanation}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-semibold">+{xpGained} XP earned</p>
          </div>
        )}

        {!submitted
          ? <button className="btn btn-teal btn-full btn-lg"
              disabled={lesson.contentType !== 'fill_blank' && lesson.contentType !== 'true_false' && selected === null}
              onClick={handleSubmit}>Submit answer</button>
          : <button className="btn btn-indigo btn-full btn-lg" onClick={handleNext}>Next lesson →</button>
        }

        {/* Achievement modal */}
        {newBadges.length > 0 && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50 p-4">
            <div className="card max-w-xs w-full text-center animate-bounce-in">
              <div className="text-6xl mb-3">🏅</div>
              <h2 className="text-xl font-black mb-2 dark:text-white" style={{fontFamily:'Nunito,sans-serif'}}>Badge unlocked!</h2>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {newBadges.map(b => <span key={b} className="badge badge-teal text-sm">{b.replace(/_/g,' ')}</span>)}
              </div>
              <button className="btn btn-teal btn-full" onClick={() => setNewBadges([])}>Awesome! 🎉</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}