import { useState } from 'react';
import NavBar from '../../components/shared/NavBar';
import api from '../../api/axios';

const SUBJECTS = ['math','science','hindi','english','evs'];
const SUBJ_ACTIVE = { math:'bg-[#EEEDFE] dark:bg-[#3C3489]/30 text-[#3C3489] dark:text-[#AFA9EC] border-[#7F77DD]', science:'bg-[#E1F5EE] dark:bg-[#085041]/30 text-[#085041] dark:text-[#5DCAA5] border-[#5DCAA5]', hindi:'bg-[#FAEEDA] dark:bg-[#633806]/30 text-[#633806] dark:text-[#FAC775] border-[#EF9F27]', english:'bg-[#FAECE7] dark:bg-[#712B13]/30 text-[#712B13] dark:text-[#F0997B] border-[#D85A30]', evs:'bg-[#EAF3DE] dark:bg-[#27500A]/30 text-[#27500A] dark:text-[#97C459] border-[#639922]' };

const EMPTY_OPTIONS = [{text:'',isCorrect:false},{text:'',isCorrect:false},{text:'',isCorrect:false},{text:'',isCorrect:false}];

export default function TeacherContent() {
  const [form, setForm] = useState({
    subject:'math', topic:'', difficulty:1, gradeLevel:3,
    contentType:'mcq', questionText:'', explanation:'', correctAnswer:'',
    options: EMPTY_OPTIONS,
  });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const set    = (k,v) => setForm(f => ({ ...f, [k]: v }));
  const setOpt = (i,k,v) => setForm(f => {
    const opts = [...f.options];
    opts[i] = { ...opts[i], [k]: v };
    if (k === 'isCorrect' && v) opts.forEach((_,j) => { if (j!==i) opts[j].isCorrect=false; });
    return { ...f, options: opts };
  });

  async function handleSave() {
    if (!form.topic || !form.questionText) { setError('Please fill in topic and question.'); return; }
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.post('/lessons', {
        subject:     form.subject,
        topic:       form.topic,
        gradeLevel:  form.gradeLevel,
        difficulty:  form.difficulty,
        contentType: form.contentType,
        question:    { text: form.questionText },
        options:     form.contentType === 'fill_blank' ? [] : form.options,
        correctAnswer: form.contentType === 'fill_blank' ? form.correctAnswer : '',
        explanation: form.explanation,
        language:    'hi',
      });
      setSuccess(true);
      setForm(f => ({ ...f, topic:'', questionText:'', explanation:'', correctAnswer:'', options: EMPTY_OPTIONS }));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save lesson');
    } finally { setSaving(false); }
  }

  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-content page" style={{maxWidth:640}}>
        <h1 className="dark:text-white mb-1" style={{fontFamily:'Nunito,sans-serif'}}>📚 Create lesson</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Add new content to the lesson library</p>

        {success && <div className="alert-success mb-5 animate-fade-up"><p className="font-bold text-[#085041] dark:text-[#5DCAA5]">✅ Lesson saved successfully!</p></div>}
        {error   && <div className="alert-danger  mb-5"><p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p></div>}

        <div className="card">
          <div className="form-group">
            <label className="label">Subject</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => set('subject',s)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer capitalize border-none ${form.subject===s ? SUBJ_ACTIVE[s] : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Grade level</label>
              <select className="select" value={form.gradeLevel} onChange={e => set('gradeLevel',parseInt(e.target.value))}>
                {[1,2,3,4,5,6].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Difficulty</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(d => (
                  <button key={d} onClick={() => set('difficulty',d)}
                    className={`flex-1 py-2 rounded-lg text-xs font-black border-none transition-all cursor-pointer ${form.difficulty===d ? 'bg-[#185FA5] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Topic</label>
            <input className="input" value={form.topic} onChange={e => set('topic',e.target.value)} placeholder="e.g. Addition with carrying" />
          </div>

          <div className="form-group">
            <label className="label">Content type</label>
            <select className="select" value={form.contentType} onChange={e => set('contentType',e.target.value)}>
              <option value="mcq">Multiple choice (MCQ)</option>
              <option value="fill_blank">Fill in the blank</option>
              <option value="true_false">True / False</option>
              <option value="audio_mcq">Audio MCQ</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Question</label>
            <textarea className="textarea" rows={3} value={form.questionText} onChange={e => set('questionText',e.target.value)} placeholder="Type the question here…" />
          </div>

          {(form.contentType === 'mcq' || form.contentType === 'audio_mcq') && (
            <div className="form-group">
              <label className="label">Answer options — tick the correct one</label>
              <div className="flex flex-col gap-2 mt-1">
                {form.options.map((opt,i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${opt.isCorrect ? 'border-[#5DCAA5] bg-[#E1F5EE] dark:bg-[#085041]/15' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'}`}>
                    <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => setOpt(i,'isCorrect',true)}
                      className="w-4 h-4 accent-[#5DCAA5] shrink-0 cursor-pointer" />
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${opt.isCorrect ? 'bg-[#5DCAA5] text-[#04342C]' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                      {String.fromCharCode(65+i)}
                    </span>
                    <input className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400"
                      value={opt.text} onChange={e => setOpt(i,'text',e.target.value)} placeholder={`Option ${String.fromCharCode(65+i)}…`} />
                    {opt.isCorrect && <span className="text-[#085041] dark:text-[#5DCAA5] text-xs font-black shrink-0">✓ Correct</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {form.contentType === 'fill_blank' && (
            <div className="form-group">
              <label className="label">Correct answer</label>
              <input className="input" value={form.correctAnswer} onChange={e => set('correctAnswer',e.target.value)} placeholder="e.g. 20" />
            </div>
          )}

          <div className="form-group">
            <label className="label">Explanation (shown after answer)</label>
            <textarea className="textarea" rows={2} value={form.explanation} onChange={e => set('explanation',e.target.value)} placeholder="e.g. When we add with carrying…" />
          </div>

          <button className="btn btn-teal btn-full btn-lg" onClick={handleSave} disabled={saving || !form.topic || !form.questionText}>
            {saving ? 'Saving…' : 'Save lesson to library ✓'}
          </button>
        </div>
      </main>
    </div>
  );
}