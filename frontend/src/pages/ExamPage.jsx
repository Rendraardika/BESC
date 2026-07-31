import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const DEFAULT_TAB_SWITCH_LIMIT = 3;

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}m:${String(rest).padStart(2, '0')}s`;
};

const options = [
  ['A', 'option_a'],
  ['B', 'option_b'],
  ['C', 'option_c'],
  ['D', 'option_d'],
  ['E', 'option_e'],
];

export default function ExamPage({ competition, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissionID, setSubmissionID] = useState('');
  const [remaining, setRemaining] = useState((competition.duration_minutes || 60) * 60);
  const [violations, setViolations] = useState(0);
  const [tabSwitchLimit, setTabSwitchLimit] = useState(Number(competition.tab_switch_limit || DEFAULT_TAB_SWITCH_LIMIT));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const answersRef = useRef({});
  const questionButtonsRef = useRef([]);
  const violationsRef = useRef(0);
  const submittingRef = useRef(false);
  const lockedRef = useRef(false);
  const tabSwitchLimitRef = useRef(Number(competition.tab_switch_limit || DEFAULT_TAB_SWITCH_LIMIT));
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { violationsRef.current = violations; }, [violations]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { tabSwitchLimitRef.current = tabSwitchLimit; }, [tabSwitchLimit]);
  useEffect(() => {
    questionButtonsRef.current[currentIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentIndex]);

  const logEvent = async (eventType, metadata = '') => {
    if (!submissionID) return;
    try {
      return await apiRequest('/proctoring/events', {
        method: 'POST',
        body: JSON.stringify({ submission_id: submissionID, event_type: eventType, metadata }),
      });
    } catch {}
  };

  const submit = async ({ forced = false, reason = '' } = {}) => {
    if (submittingRef.current || lockedRef.current) return;
    setError('');
    setSubmitting(true);
    submittingRef.current = true;
    if (forced) {
      setLocked(true);
      lockedRef.current = true;
    }

    try {
      const result = await apiRequest(`/competitions/${competition.competition_id}/exam/submit`, {
        method: 'POST',
        body: JSON.stringify({
          answers: questions
            .filter((question) => answersRef.current[question.id])
            .map((question) => ({ question_id: question.id, answer: answersRef.current[question.id] })),
        }),
      });
      if (reason) alert(reason);
      onFinish(result);
    } catch (err) {
      setError(err.message);
      if (!forced) {
        setLocked(false);
        lockedRef.current = false;
      }
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const submission = await apiRequest(`/competitions/${competition.competition_id}/exam/start`, {
          method: 'POST',
        });
        setSubmissionID(submission.id);
        setViolations(Number(submission.violation_count || 0));
        apiRequest(`/competitions/${competition.competition_id}`)
          .then((competitionDetail) => {
            const limit = Number(competitionDetail.tab_switch_limit || DEFAULT_TAB_SWITCH_LIMIT);
            setTabSwitchLimit(limit);
            tabSwitchLimitRef.current = limit;
          })
          .catch(() => {});
        const examQuestions = await apiRequest(`/competitions/${competition.competition_id}/exam/questions`);
        setQuestions(examQuestions);
      } catch (err) {
        setError(err.message);
        setLocked(true);
      }
    };
    load();
  }, [competition.competition_id]);

  useEffect(() => {
    if (!submissionID || locked) return undefined;
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        window.clearInterval(timer);
        submit({ forced: true, reason: 'Waktu ujian habis. Jawaban terakhir telah dikirim.' });
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [submissionID, locked]);

  useEffect(() => {
    const visibility = async () => {
      if (!document.hidden || !submissionID || lockedRef.current) return;
      const event = await logEvent('tab_switch', 'visibilitychange');
      const next = Number(event?.violation_count || violationsRef.current);
      if (next > 0) {
        setViolations(next);
      }
      const limit = tabSwitchLimitRef.current || DEFAULT_TAB_SWITCH_LIMIT;
      if (next >= limit) {
        submit({ forced: true, reason: `Batas pindah tab (${limit} kali) tercapai. Ujian dihentikan dan jawaban terakhir telah dikirim.` });
      }
    };
    const block = (event) => {
      event.preventDefault();
      logEvent(event.type === 'contextmenu' ? 'right_click' : 'copy_attempt');
    };

    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('contextmenu', block);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
    };
  }, [submissionID]);

  const selectAnswer = (questionID, answer) => {
    setError('');
    setAnswers((current) => ({ ...current, [questionID]: answer }));
  };

  const goToQuestion = (index) => {
    setError('');
    setCurrentIndex(index);
  };

  return (
    <main className="min-h-screen select-none bg-white text-[#1f2937]">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-end border-b border-slate-200 bg-white px-6 md:px-7">
        <div className="grid h-10 min-w-[122px] place-items-center rounded border border-slate-200 bg-white px-4 font-mono text-base text-red-500 shadow-sm">
          {formatTime(remaining)}
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-72px)] md:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white md:sticky md:top-[72px] md:h-[calc(100vh-72px)] md:border-b-0 md:border-r">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 p-5">
              <h1 className="max-w-[240px] text-lg font-extrabold leading-7 text-slate-700">
                Soal kategori: {competition.competition_title || 'Ujian BESC'}
              </h1>
              <div className="mt-5 text-sm font-bold text-slate-500">
                {answeredCount}/{questions.length} terjawab
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-5 md:overflow-x-hidden md:overflow-y-auto">
              <div className="grid w-max grid-flow-col grid-rows-2 gap-3 md:w-full md:grid-flow-row md:grid-cols-5 md:grid-rows-none">
                {questions.map((question, index) => {
                  const answered = Boolean(answers[question.id]);
                  const active = index === currentIndex;
                  return (
                    <button
                      key={question.id}
                      ref={(element) => { questionButtonsRef.current[index] = element; }}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={`grid h-10 w-10 place-items-center rounded-lg border text-sm font-bold shadow-sm transition ${active ? 'border-[#29384a] bg-[#29384a] text-white' : answered ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-300 bg-white text-slate-700 hover:border-[#29384a]'}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="px-7 py-10 md:px-8 lg:px-12">
          {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

          {!currentQuestion ? (
            <div className="text-sm font-semibold text-slate-500">Memuat soal...</div>
          ) : (
            <article className="max-w-3xl">
              <h2 className="text-base leading-8 text-slate-800 md:text-lg">{currentQuestion.question}</h2>
              {currentQuestion.image && (
                <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <img src={currentQuestion.image} alt="Gambar soal" className="max-h-[420px] w-full object-contain" />
                </div>
              )}

              <div className="mt-10 space-y-4">
                {options.map(([label, field]) => (
                  <label key={label} className="flex cursor-pointer items-start gap-4 text-base leading-7 text-slate-800">
                    <input
                      disabled={locked}
                      type="radio"
                      name={currentQuestion.id}
                      checked={answers[currentQuestion.id] === label}
                      onChange={() => selectAnswer(currentQuestion.id, label)}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#29384a]"
                    />
                    <span>{currentQuestion[field]}</span>
                  </label>
                ))}
              </div>

              <div className="mt-8 border-t border-slate-200 pt-10">
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-400 transition hover:text-[#29384a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-xl leading-none">&lsaquo;</span>
                    Sebelumnya
                  </button>
                  {currentIndex === questions.length - 1 ? (
                    <button
                      type="button"
                      disabled={submitting || locked || questions.length === 0}
                      onClick={() => submit()}
                      className="rounded-lg bg-[#0d9488] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#087f75] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? 'Mengirim...' : 'Selesai & Kirim Jawaban'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                      className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-400 transition hover:text-[#29384a]"
                    >
                      Selanjutnya
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-xl leading-none">&rsaquo;</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
