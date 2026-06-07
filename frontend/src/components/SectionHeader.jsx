export default function SectionHeader({ label, title, sub, center = false }) {
  return (
    <div className={center ? 'mb-10 text-center' : 'mb-8'}>
      <div className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[#044b86]">{label}</div>
      <h2 className="mb-3 font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-[-0.02em] text-slate-950 md:text-4xl">{title}</h2>
      {sub && <p className={`text-sm leading-7 text-slate-500 ${center ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>{sub}</p>}
    </div>
  );
}
