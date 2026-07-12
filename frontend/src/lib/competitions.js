export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (amount === 0) return 'Gratis';
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
};

export const formatDate = (value) => {
  if (!value) return 'Belum ditentukan';
  return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const competitionToEvent = (competition) => {
  const badges = String(competition.badges || '')
    .split(',')
    .map((badge) => badge.trim())
    .filter(Boolean);
  const price = Number(competition.price || 0);
  const originalPrice = Number(competition.original_price || 0);
  const discount = originalPrice > price && originalPrice > 0
    ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
    : '';

  return {
    id: competition.id,
    icon: 'B',
    tags: [competition.category, competition.level, ...badges].filter(Boolean),
    title: competition.title,
    desc: competition.description,
    price: formatCurrency(price),
    original: originalPrice > 0 ? formatCurrency(originalPrice) : '',
    discount,
    deadline: formatDate(competition.registration_deadline),
    participants: Number(competition.quota || 0) > 0 ? `${Number(competition.quota).toLocaleString('id-ID')} peserta` : 'Kuota terbuka',
    category: [competition.category, competition.level].filter(Boolean).join(' ') || 'Kompetisi',
    badges,
    banner: competition.banner,
    competition,
  };
};
