export default function StatsStrip() {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-6 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 text-center md:grid-cols-4">
        {[
          ['19 jt', 'Peserta Aktif'],
          ['34', 'Provinsi Terwakili'],
          ['10+', 'Bidang Materi'],
          ['Rp217 T', 'Total Hadiah'],
        ].map(([num, label]) => (
          <div key={label} className="border-slate-200 py-2 md:border-r md:last:border-r-0">
            <div className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold text-[#1c79c6]">{num}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
