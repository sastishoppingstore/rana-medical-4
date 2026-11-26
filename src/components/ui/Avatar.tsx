export default function Avatar({ name, size = 56, color }: { name: string; size?: number; color?: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  const palette = ['#c02736', '#23244a', '#7c3aed', '#db2777', '#ea580c', '#9e1f2c', '#1a1b3a'];
  const bg = color || palette[name.charCodeAt(0) % palette.length];
  return (
    <div className="rounded-2xl grid place-items-center text-white font-display font-bold shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}>
      {initials || '?'}
    </div>
  );
}
