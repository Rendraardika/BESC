export default function Button({ children, variant = 'solid', onClick, href = '#' }) {
  const className = variant === 'ghost'
    ? 'rounded-full border-2 border-[#1c79c6] px-5 py-2 text-sm font-bold text-[#1c79c6] transition hover:bg-blue-50'
    : 'rounded-full bg-[linear-gradient(180deg,#1c79c6,#044b86)] px-5 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1c79c6]/25';

  if (onClick) {
    return <button type="button" onClick={onClick} className={className}>{children}</button>;
  }

  return <a href={href} className={className}>{children}</a>;
}
