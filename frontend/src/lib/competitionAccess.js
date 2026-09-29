export const normalizeRegistrationStatus = (status = '') => String(status || '').trim().toLowerCase();

export const isPreliminaryEligible = (registration, fallbackVerified = false) => {
  const status = normalizeRegistrationStatus(registration?.status);
  return fallbackVerified || ['verified', 'semifinalist', 'finalist'].includes(status);
};

export const isSemifinalEligible = (registration) => {
  const status = normalizeRegistrationStatus(registration?.status);
  return ['semifinalist', 'finalist'].includes(status);
};

export const buildExamRegistration = (registration, competition, round = 'preliminary') => ({
  ...(registration || {}),
  competition_id: registration?.competition_id || competition?.id,
  competition_title: registration?.competition_title || competition?.title,
  competition_slug: registration?.competition_slug || competition?.slug,
  status: registration?.status || 'verified',
  round,
});

export const competitionAction = ({ registration, competition, fallbackVerified = false, blocked = false }) => {
  const status = normalizeRegistrationStatus(registration?.status);

  if (status === 'finalist') {
    return { disabled: true, label: 'Final Offline', round: 'semifinal', tone: 'muted' };
  }

  if (status === 'not_finalist') {
    return { disabled: true, label: 'Tidak Lolos Final', round: 'semifinal', tone: 'muted' };
  }

  if (isSemifinalEligible(registration)) {
    if (registration?.semifinal_exam_completed) {
      return {
        disabled: true,
        label: 'Semifinal Selesai',
        round: 'semifinal',
        tone: 'muted',
      };
    }
    if (!competition?.semifinal_start_time || !competition?.semifinal_end_time) {
      return {
        disabled: true,
        label: 'Jadwal Belum Ada',
        round: 'semifinal',
        tone: 'muted',
      };
    }
    const now = Date.now();
    const semifinalStart = new Date(competition.semifinal_start_time).getTime();
    const semifinalEnd = new Date(competition.semifinal_end_time).getTime();
    if (Number.isFinite(semifinalStart) && now < semifinalStart) {
      return {
        disabled: true,
        label: 'Semifinal Belum Dibuka',
        round: 'semifinal',
        tone: 'muted',
      };
    }
    if (Number.isFinite(semifinalEnd) && now >= semifinalEnd) {
      return {
        disabled: true,
        label: 'Semifinal Ditutup',
        round: 'semifinal',
        tone: 'muted',
      };
    }
    return {
      disabled: false,
      label: 'Kerjakan Semifinal',
      round: 'semifinal',
      tone: 'semifinal',
    };
  }

  if (registration?.preliminary_exam_completed) {
    return {
      disabled: true,
      label: status === 'eliminated' ? 'Tidak Lolos Semifinal' : 'Penyisihan Selesai',
      round: 'preliminary',
      tone: 'muted',
    };
  }

  if (isPreliminaryEligible(registration, fallbackVerified)) {
    return {
      disabled: false,
      label: 'Kerjakan Penyisihan',
      round: 'preliminary',
      tone: 'primary',
    };
  }

  if (status === 'rejected') {
    return { disabled: false, label: 'Upload Ulang Bukti', round: 'preliminary', tone: 'warning' };
  }

  if (status === 'eliminated') {
    return { disabled: true, label: 'Tidak Lolos Semifinal', round: 'preliminary', tone: 'muted' };
  }

  if (blocked) {
    return { disabled: true, label: 'Tidak Tersedia', round: 'preliminary', tone: 'muted' };
  }

  if (registration) {
    return { disabled: true, label: 'Menunggu Verifikasi', round: 'preliminary', tone: 'muted' };
  }

  return { disabled: false, label: 'Daftar', round: 'preliminary', tone: 'primary' };
};

export const registrationStatusLabel = (registration, fallbackVerified = false) => {
  const status = normalizeRegistrationStatus(registration?.status);
  if (registration?.semifinal_exam_completed) return 'Semifinal Selesai';
  if (status === 'semifinalist') return 'Lolos Semifinal';
  if (status === 'finalist') return 'Lolos Final';
  if (status === 'not_finalist') return 'Tidak Lolos Final';
  if (status === 'not_winner') return 'Finalis';
  if (status === 'winner_1') return 'Juara 1';
  if (status === 'winner_2') return 'Juara 2';
  if (status === 'winner_3') return 'Juara 3';
  if (status === 'rejected') return 'Pembayaran Ditolak';
  if (status === 'eliminated') return 'Tidak Lolos Semifinal';
  if (registration?.preliminary_exam_completed) return 'Menunggu Hasil Penyisihan';
  if (isPreliminaryEligible(registration, fallbackVerified)) return 'Pembayaran Terverifikasi';
  if (registration) return 'Menunggu Verifikasi';
  return 'Pendaftaran Dibuka';
};
