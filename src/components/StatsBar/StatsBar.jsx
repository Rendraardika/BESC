import './StatsBar.css';

const stats = [
  { num: '500+', label: 'Peserta Tahun Lalu' },
  { num: '34', label: 'Provinsi Terwakili' },
  { num: '10', label: 'Bidang Materi' },
  { num: '50 Jt', label: 'Total Hadiah' },
];

export default function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="stats-inner">
        {stats.map((stat, i) => (
          <div className="stat-item" key={i}>
            <div className="stat-num">{stat.num}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
