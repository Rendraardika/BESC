import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function ExamPage({ competition, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submissionID, setSubmissionID] = useState('');
  const [remaining, setRemaining] = useState((competition.duration_minutes || 60) * 60);
  const [violations, setViolations] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const answersRef = useRef({});
  const token = localStorage.getItem('besc_token');
  const limit = competition.tab_switch_limit || 5;

  useEffect(() => { answersRef.current = answers; }, [answers]);

  const logEvent = async (eventType, metadata = '') => {
    if (!submissionID) return;
    try {
      await apiRequest('/proctoring/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ submission_id: submissionID, event_type: eventType, metadata }),
      });
    } catch {}
  };

  const submit = async ({ forced = false, reason = '' } = {}) => {
    if (submitting || locked) return;
    if (!forced && Object.keys(answersRef.current).length !== questions.length) {
      setError('Jawab seluruh soal sebelum menyelesaikan ujian.');
      return;
    }
    setSubmitting(true);
    if (forced) setLocked(true);
    try {
      const result = await apiRequest(`/competitions/${competition.competition_id}/exam/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: questions.filter((q) => answersRef.current[q.id]).map((q) => ({ question_id: q.id, answer: answersRef.current[q.id] })) }),
      });
      if (reason) alert(reason);
      onFinish(result);
    } catch (err) {
      setError(err.message);
      if (!forced) setLocked(false);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let snapshotTimer;
    const load = async () => {
      try {
        const submission = await apiRequest(`/competitions/${competition.competition_id}/exam/start`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        setSubmissionID(submission.id);
        setQuestions(await apiRequest(`/competitions/${competition.competition_id}/exam/questions`, { headers: { Authorization: `Bearer ${token}` } }));
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        await apiRequest('/proctoring/events', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ submission_id: submission.id, event_type: 'camera_on' }) });
        snapshotTimer = window.setInterval(() => captureSnapshot(submission.id), 30000);
      } catch (err) {
        setError(`Kamera wajib aktif untuk mengikuti ujian. ${err.message}`);
        setLocked(true);
      }
    };
    load();
    return () => {
      window.clearInterval(snapshotTimer);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [competition.competition_id, token]);

  const captureSnapshot = (id = submissionID) => {
    const video = videoRef.current;
    if (!video || !id || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      const body = new FormData();
      body.append('snapshot', blob, 'snapshot.jpg');
      try { await apiRequest(`/submissions/${id}/proctoring/snapshots`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body }); } catch {}
    }, 'image/jpeg', 0.72);
  };

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
      if (!document.hidden || !submissionID || locked) return;
      const next = violations + 1;
      setViolations(next);
      await logEvent('tab_switch', `Pelanggaran ${next} dari ${limit}`);
      if (next >= limit) submit({ forced: true, reason: `Batas pindah tab (${limit} kali) tercapai. Ujian dihentikan dan jawaban terakhir telah dikirim.` });
      else setError(`Peringatan: Anda berpindah tab ${next}/${limit} kali. Ujian akan dihentikan saat batas tercapai.`);
    };
    const block = (event) => { event.preventDefault(); logEvent(event.type === 'contextmenu' ? 'right_click' : 'copy_attempt'); };
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
  }, [submissionID, violations, limit, locked]);

  return (
    <main className="min-h-screen select-none bg-[#f4f8f7] px-5 py-8">
      <section className="mx-auto max-w-5xl">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div><div className="text-xs font-extrabold uppercase text-teal-600">Ujian BESC</div><h1 className="mt-1 text-xl font-extrabold">{competition.competition_title}</h1></div>
          <div className="flex items-center gap-4">
            <video ref={videoRef} autoPlay muted playsInline className="h-16 w-24 rounded-lg bg-slate-900 object-cover" />
            <div><div className="text-lg font-extrabold text-red-600">{formatTime(remaining)}</div><div className="text-xs font-bold text-slate-500">{Object.keys(answers).length}/{questions.length} terjawab • Tab {violations}/{limit}</div></div>
          </div>
        </header>
        {error && <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
        <div className="mt-5 space-y-4">{questions.map((q, index) => <article key={q.id} className="rounded-lg border border-slate-200 bg-white p-6"><div className="text-xs font-extrabold text-teal-600">Soal {index + 1}</div><h2 className="mt-3 font-bold leading-7">{q.question}</h2><div className="mt-5 grid gap-3">{[['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]].map(([key, value]) => <label key={key} className={`flex cursor-pointer gap-3 rounded-lg border p-4 text-sm font-semibold ${answers[q.id] === key ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`}><input disabled={locked} type="radio" name={q.id} checked={answers[q.id] === key} onChange={() => setAnswers((current) => ({ ...current, [q.id]: key }))} />{key}. {value}</label>)}</div></article>)}</div>
        <div className="mt-6 flex justify-end"><button type="button" disabled={submitting || locked || questions.length === 0} onClick={() => submit()} className="rounded-lg bg-[#0d9488] px-6 py-3 text-sm font-extrabold text-white disabled:opacity-50">{submitting ? 'Mengirim...' : 'Selesai & Kirim Jawaban'}</button></div>
      </section>
    </main>
  );
}
