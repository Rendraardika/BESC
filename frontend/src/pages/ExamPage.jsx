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

const calculateExamRemainingSeconds = (comp, sub) => {
  const now = Date.now();
  const durationMinutes = Number(comp?.duration_minutes || 60);
  const totalSeconds = durationMinutes * 60;

  // 1. Potong waktu otomatis jika peserta terlambat masuk dari jadwal resmi start_time
  let elapsedSchedule = 0;
  if (comp?.start_time) {
    const scheduledStartMs = new Date(comp.start_time).getTime();
    if (!isNaN(scheduledStartMs) && now > scheduledStartMs) {
      elapsedSchedule = Math.floor((now - scheduledStartMs) / 1000);
    }
  }

  // 2. Waktu yang sudah berjalan sejak peserta pertama kali klik mulai (submission.started_at)
  let elapsedSubmission = 0;
  if (sub?.started_at) {
    const subStartMs = new Date(sub.started_at).getTime();
    if (!isNaN(subStartMs)) {
      elapsedSubmission = Math.max(0, Math.floor((now - subStartMs) / 1000));
    }
  }

  // Ambil waktu terpakai terbesar (keterlambatan dari jadwal resmi atau waktu yang sudah berjalan sejak mulai)
  const elapsed = Math.max(elapsedSchedule, elapsedSubmission);
  let remaining = Math.max(0, totalSeconds - elapsed);

  // 3. Batasi waktu agar tidak melebihi jadwal akhir kompetisi (end_time)
  if (comp?.end_time) {
    const endMs = new Date(comp.end_time).getTime();
    if (!isNaN(endMs)) {
      const remainingTillEnd = Math.max(0, Math.floor((endMs - now) / 1000));
      remaining = Math.min(remaining, remainingTillEnd);
    }
  }

  return remaining;
};

export default function ExamPage({ competition, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissionID, setSubmissionID] = useState('');
  const [remaining, setRemaining] = useState(() => calculateExamRemainingSeconds(competition, null));
  const [violations, setViolations] = useState(0);
  const [tabSwitchLimit, setTabSwitchLimit] = useState(Number(competition.tab_switch_limit || DEFAULT_TAB_SWITCH_LIMIT));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [examResult, setExamResult] = useState(null);

  const answersRef = useRef({});
  const questionsRef = useRef([]);
  const questionButtonsRef = useRef([]);
  const violationsRef = useRef(0);
  const noticeTimerRef = useRef(null);
  const submittingRef = useRef(false);
  const lockedRef = useRef(false);
  const tabSwitchLimitRef = useRef(Number(competition.tab_switch_limit || DEFAULT_TAB_SWITCH_LIMIT));
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { violationsRef.current = violations; }, [violations]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);
  useEffect(() => { tabSwitchLimitRef.current = tabSwitchLimit; }, [tabSwitchLimit]);
  useEffect(() => {
    questionButtonsRef.current[currentIndex]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [currentIndex]);
  useEffect(() => () => window.clearTimeout(noticeTimerRef.current), []);

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 4500);
  };

  const updateViolationCount = (count) => {
    const next = Math.max(0, Number(count) || 0);
    violationsRef.current = next;
    setViolations(next);
    return next;
  };

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

    // Peserta tidak bisa mengakhiri ujian manual jika belum mengerjakan semua soal
    const currentAnswered = Object.keys(answersRef.current).length;
    const totalQuestions = questionsRef.current.length;
    if (!forced && totalQuestions > 0 && currentAnswered < totalQuestions) {
      showNotice(`Anda belum menjawab semua soal (${currentAnswered}/${totalQuestions} terjawab). Anda wajib menjawab seluruh soal untuk mengakhiri ujian, atau menunggu hingga waktu pengerjaan habis.`);
      return;
    }

    setShowConfirmModal(false);
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
          answers: questionsRef.current
            .filter((question) => answersRef.current[question.id])
            .map((question) => ({ question_id: question.id, answer: answersRef.current[question.id] })),
        }),
      });
      if (submissionID) {
        try { localStorage.removeItem(`besc_exam_answers_${submissionID}`); } catch {}
      }
      if (reason) showNotice(reason);
      setExamResult(result);
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
        updateViolationCount(submission.violation_count || 0);

        // Restore persisted answers if user reloaded
        try {
          const savedAnswers = localStorage.getItem(`besc_exam_answers_${submission.id}`);
          if (savedAnswers) {
            const parsed = JSON.parse(savedAnswers);
            setAnswers(parsed);
            answersRef.current = parsed;
          }
        } catch {}

        // Fetch fresh competition details for accurate start_time, end_time, duration & limits
        const compDetail = await apiRequest(`/competitions/${competition.competition_id}`).catch(() => null);
        const mergedComp = { ...competition, ...compDetail };

        const limit = Number(mergedComp.tab_switch_limit || DEFAULT_TAB_SWITCH_LIMIT);
        setTabSwitchLimit(limit);
        tabSwitchLimitRef.current = limit;

        // Calculate accurate remaining seconds based on schedule start_time & submission timestamp
        const calculatedRemaining = calculateExamRemainingSeconds(mergedComp, submission);
        setRemaining(calculatedRemaining);

        if (calculatedRemaining <= 0) {
          submit({ forced: true, reason: 'Waktu ujian telah berakhir. Jawaban yang sempat dikerjakan telah dikirim otomatis.' });
          return;
        }

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
    if (!submissionID || locked || examResult) return undefined;
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        window.clearInterval(timer);
        submit({ forced: true, reason: 'Waktu ujian habis. Jawaban yang telah dikerjakan telah dikirim otomatis.' });
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [submissionID, locked, examResult]);

  useEffect(() => {
    const visibility = async () => {
      if (!document.hidden || !submissionID || lockedRef.current || examResult) return;
      const limit = tabSwitchLimitRef.current || DEFAULT_TAB_SWITCH_LIMIT;
      const localCount = updateViolationCount(violationsRef.current + 1);
      showNotice(`Peringatan pindah tab ${Math.min(localCount, limit)}/${limit}. Jika mencapai batas, ujian otomatis dikirim.`);
      const event = await logEvent('tab_switch', 'visibilitychange');
      const backendCount = Number(event?.violation_count || 0);
      const next = backendCount > localCount ? updateViolationCount(backendCount) : localCount;
      if (next >= limit) {
        showNotice(`Batas pindah tab ${limit} kali tercapai. Ujian sedang dikirim otomatis.`);
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
  }, [submissionID, examResult]);

  const selectAnswer = (questionID, answer) => {
    setError('');
    setAnswers((current) => {
      const next = { ...current, [questionID]: answer };
      if (submissionID) {
        try {
          localStorage.setItem(`besc_exam_answers_${submissionID}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const goToQuestion = (index) => {
    setError('');
    setCurrentIndex(index);
  };

  const handleFinishButtonClick = () => {
    if (answeredCount < questions.length) {
      showNotice(`Anda belum menjawab semua soal (${answeredCount}/${questions.length} terjawab). Anda wajib menjawab seluruh soal untuk mengakhiri ujian, atau menunggu waktu habis.`);
      return;
    }
    setShowConfirmModal(true);
  };

  // If exam has been submitted, show Result and Detailed Review Page
  if (examResult) {
    return <ExamResultReview result={examResult} competition={competition} onBack={onFinish} />;
  }

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
          {notice && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{notice}</div>}

          {!currentQuestion && error ? null : !currentQuestion ? (
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
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        type="button"
                        disabled={submitting || locked || questions.length === 0}
                        onClick={handleFinishButtonClick}
                        className={`rounded-lg px-5 py-3 text-sm font-extrabold text-white shadow-sm transition ${answeredCount === questions.length ? 'bg-[#0d9488] hover:bg-[#087f75]' : 'bg-slate-400 hover:bg-slate-500'}`}
                      >
                        {submitting ? 'Mengirim...' : 'Selesai & Kirim Jawaban'}
                      </button>
                      {answeredCount < questions.length && (
                        <span className="text-[11px] font-semibold text-amber-700">
                          * Jawab {questions.length - answeredCount} soal lagi untuk mengakhiri
                        </span>
                      )}
                    </div>
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

      {/* Pop up Konfirmasi Selesai Ujian */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-2xl text-teal-700">
                📝
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Konfirmasi Selesai Ujian
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin mengakhiri dan mengirim seluruh jawaban Anda? Jawaban yang telah dikirim tidak dapat diubah kembali.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Total Soal Terjawab:</span>
              <span className="rounded-md bg-teal-100 px-2.5 py-1 font-bold text-teal-800">{answeredCount} dari {questions.length} Soal</span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => submit()}
                className="rounded-xl bg-[#0d9488] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-900/10 hover:bg-teal-700 transition disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Ya, Kirim Ujian'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ExamResultReview({ result, competition, onBack }) {
  const [filter, setFilter] = useState('all');
  const reviewItems = result.review || [];
  const unansweredCount = Math.max(0, result.total_questions - result.correct_count - result.wrong_count);

  const filteredItems = reviewItems.filter((item) => {
    if (filter === 'correct') return item.is_correct;
    if (filter === 'wrong') return item.user_answer && !item.is_correct;
    if (filter === 'unanswered') return !item.user_answer;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-600">Hasil & Pembahasan</span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">{competition.competition_title || 'Ujian BESC'}</h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl bg-[#1c79c6] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#1560a0] transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Score & Summary Banner */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[220px_1fr] items-center">
            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-[#073b4c] p-6 text-white text-center shadow-md">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-100">Nilai Akhir</span>
              <div className="mt-2 text-5xl font-black">{Math.round(result.score)}</div>
              <span className="mt-1 text-xs text-teal-100/90 font-semibold">Skor Perolehan</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-center">
                <span className="text-2xl">✅</span>
                <div className="mt-1 text-2xl font-black text-emerald-700">{result.correct_count}</div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Benar</div>
              </div>

              <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 text-center">
                <span className="text-2xl">❌</span>
                <div className="mt-1 text-2xl font-black text-red-600">{result.wrong_count}</div>
                <div className="text-[11px] font-bold text-red-800 uppercase tracking-wide">Salah</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <span className="text-2xl">⚪</span>
                <div className="mt-1 text-2xl font-black text-slate-700">{unansweredCount}</div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Kosong</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <h2 className="text-base font-extrabold text-slate-900">Pembahasan Setiap Soal</h2>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === 'all' ? 'bg-[#073b4c] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Semua ({reviewItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('correct')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === 'correct' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              Benar ({result.correct_count})
            </button>
            <button
              type="button"
              onClick={() => setFilter('wrong')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === 'wrong' ? 'bg-red-600 text-white' : 'text-red-700 hover:bg-red-50'}`}
            >
              Salah ({result.wrong_count})
            </button>
            {unansweredCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter('unanswered')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === 'unanswered' ? 'bg-slate-700 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Kosong ({unansweredCount})
              </button>
            )}
          </div>
        </div>

        {/* Questions Review List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
              Tidak ada soal pada kategori ini.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const itemNumber = reviewItems.findIndex((q) => q.question_id === item.question_id) + 1;
              const optionKeys = [
                ['A', item.option_a],
                ['B', item.option_b],
                ['C', item.option_c],
                ['D', item.option_d],
                ['E', item.option_e],
              ];

              return (
                <article
                  key={item.question_id}
                  className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition ${
                    item.is_correct
                      ? 'border-emerald-200'
                      : item.user_answer
                      ? 'border-red-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-800">
                      Soal No. {itemNumber}
                    </span>
                    {item.is_correct ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                        ✅ Benar (+{item.score_earned})
                      </span>
                    ) : item.user_answer ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-800">
                        ❌ Salah ({item.score_earned})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                        ⚪ Tidak Dijawab (0)
                      </span>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="mt-4">
                    <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-900">
                      {item.question}
                    </p>
                    {item.image && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
                        <img src={item.image} alt="Gambar soal" className="max-h-60 max-w-full object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="mt-4 space-y-2">
                    {optionKeys.map(([key, text]) => {
                      if (!text) return null;
                      const isUserChoice = item.user_answer === key;
                      const isCorrectKey = item.correct_answer === key;

                      let style = 'border-slate-200 bg-slate-50/50 text-slate-700';
                      let badge = null;

                      if (isCorrectKey) {
                        style = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-400';
                        badge = (
                          <span className="ml-auto rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            Kunci Jawaban
                          </span>
                        );
                      }
                      if (isUserChoice && !item.is_correct) {
                        style = 'border-red-400 bg-red-50 text-red-950 font-bold ring-1 ring-red-400';
                        badge = (
                          <span className="ml-auto rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            Jawaban Anda
                          </span>
                        );
                      } else if (isUserChoice && item.is_correct) {
                        badge = (
                          <span className="ml-auto rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            Jawaban Anda (Benar)
                          </span>
                        );
                      }

                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-xs sm:text-sm ${style}`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current font-bold text-xs">
                            {key}
                          </span>
                          <span className="flex-1">{text}</span>
                          {badge}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl bg-[#073b4c] px-8 py-3.5 text-sm font-extrabold text-white shadow-xl hover:bg-[#052935] transition"
          >
            Selesai & Kembali ke Beranda
          </button>
        </div>
      </main>
    </div>
  );
}
