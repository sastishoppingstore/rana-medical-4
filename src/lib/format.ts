export const PKR = (n: number | string | null | undefined): string => {
  const num = typeof n === 'string' ? parseFloat(n) : (n ?? 0);
  if (isNaN(num)) return 'Rs. 0';
  return 'Rs. ' + num.toLocaleString('en-PK', { maximumFractionDigits: 0 });
};

export const formatDate = (d: string | null | undefined): string => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (d: string | null | undefined): string => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const generateRef = (prefix: string): string => {
  const d = new Date();
  const y = d.getFullYear().toString().slice(2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${y}${m}${day}-${rand}`;
};

export const validateMobile = (m: string): boolean => /^(\+92|0)?[0-9]{10,11}$/.test(m.replace(/\s/g, ''));

export const HOSPITAL = {
  name: 'Rana Medical Hospital',
  phone: '0324-6627054',
  tel: 'tel:+923246627054',
  whatsapp: 'https://wa.me/923246627054',
  email: 'info@ranamedical.pk',
  address: 'Main Boulevard, Lahore, Pakistan',
};
