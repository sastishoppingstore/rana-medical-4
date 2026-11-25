import { useEffect, useState, useMemo } from 'react';
import { Pill, ShoppingCart, Plus, Minus, Printer, Search, PackageX, Receipt } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, Empty, StatusBadge } from './ErpUI';
import { useToast } from '../ui/primitives';
import { PKR, HOSPITAL, todayISO } from '../../lib/format';

interface Medicine { id: number; generic_name: string; brand_name: string; category: string; sale_price: number; stock_qty: number; expiry: string }
interface CartItem { id: number; name: string; price: number; qty: number; stock: number }
interface Sale { id: number; invoice_no: string; total: number; discount: number; created_at: string; items: any[] }

export default function Pharmacy() {
  const toast = useToast();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const [m, s] = await Promise.all([api.get('/api/medicines'), api.get('/api/pharmacy-sales')]); setMeds(m); setSales(s); }
    catch { toast('Failed to load pharmacy', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = meds.filter((m) => m.generic_name.toLowerCase().includes(search.toLowerCase()) || m.brand_name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = meds.filter((m) => m.stock_qty <= 10);

  const addToCart = (m: Medicine) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === m.id);
      if (ex) return prev.map((c) => c.id === m.id ? { ...c, qty: Math.min(c.qty + 1, c.stock) } : c);
      if (m.stock_qty <= 0) { toast('Out of stock', 'error'); return prev; }
      return [...prev, { id: m.id, name: `${m.generic_name} (${m.brand_name})`, price: m.sale_price, qty: 1, stock: m.stock_qty }];
    });
  };
  const changeQty = (id: number, d: number) => setCart((prev) => prev.map((c) => c.id === id ? { ...c, qty: Math.max(1, Math.min(c.qty + d, c.stock)) } : c).filter((c) => c.qty > 0));
  const removeItem = (id: number) => setCart((prev) => prev.filter((c) => c.id !== id));

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const total = Math.max(0, subtotal - Number(discount));

  const complete = async () => {
    if (cart.length === 0) { toast('Cart is empty', 'error'); return; }
    setSaving(true);
    try {
      const sale = await api.post('/api/pharmacy-sales', {
        discount: Number(discount), items: cart.map((c) => ({ medicine_id: c.id, qty: c.qty, price: c.price })),
      });
      setReceipt(sale);
      setSales((prev) => [sale, ...prev]);
      // update local stock
      setMeds((prev) => prev.map((m) => { const c = cart.find((x) => x.id === m.id); return c ? { ...m, stock_qty: m.stock_qty - c.qty } : m; }));
      setCart([]); setDiscount(0);
      toast('Sale completed — stock updated', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner label="Loading pharmacy…" />;

  return (
    <div>
      <PageHeader title="Pharmacy & POS" subtitle="Fast point-of-sale with automatic stock management." />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Medicine search */}
        <ErpCard title="Medicine Database">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search medicines…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.map((m) => (
              <div key={m.id} className="flex items-center justify-between border border-soft-border rounded-xl p-2.5">
                <div className="text-sm">
                  <p className="font-semibold">{m.generic_name} <span className="text-slate-400 font-normal">({m.brand_name})</span></p>
                  <p className="text-xs text-slate-500">{PKR(m.sale_price)} · Stock: {m.stock_qty}</p>
                </div>
                <button onClick={() => addToCart(m)} className="btn-primary !p-2" disabled={m.stock_qty <= 0}><Plus size={16} /></button>
              </div>
            ))}
          </div>
        </ErpCard>

        {/* Cart / POS */}
        <ErpCard title="POS Cart">
          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {cart.length === 0 && <Empty msg="Scan or add medicines to cart." />}
            {cart.map((c) => (
              <div key={c.id} className="flex items-center gap-2 border-b border-soft-border pb-2">
                <div className="flex-1 text-sm">
                  <p className="font-semibold leading-tight">{c.name}</p>
                  <p className="text-xs text-slate-500">{PKR(c.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeQty(c.id, -1)} className="w-7 h-7 rounded-lg bg-ice-mint grid place-items-center"><Minus size={14} /></button>
                  <span className="w-6 text-center font-semibold">{c.qty}</span>
                  <button onClick={() => changeQty(c.id, 1)} className="w-7 h-7 rounded-lg bg-ice-mint grid place-items-center"><Plus size={14} /></button>
                </div>
                <p className="w-16 text-right text-sm font-semibold">{PKR(c.price * c.qty)}</p>
                <button onClick={() => removeItem(c.id)} className="text-red-400 text-xs">✕</button>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2 border-t pt-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><b>{PKR(subtotal)}</b></div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Discount</span>
              <input type="number" className="input-field !w-24 !py-1 text-right" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div className="flex justify-between text-lg font-display font-extrabold"><span>Total</span><span className="text-medical-teal">{PKR(total)}</span></div>
            <button onClick={complete} disabled={saving} className="btn-primary w-full"><ShoppingCart size={16} /> {saving ? 'Processing…' : 'Complete Sale'}</button>
          </div>
        </ErpCard>

        {/* Alerts + history */}
        <div className="space-y-5">
          <ErpCard title="Low Stock Alerts">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lowStock.length === 0 && <Empty msg="All stock healthy." />}
              {lowStock.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-2">
                  <PackageX size={16} /><span>{m.generic_name} — {m.stock_qty} left</span>
                </div>
              ))}
            </div>
          </ErpCard>
          <ErpCard title="Recent Sales">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sales.length === 0 && <Empty msg="No sales yet." />}
              {sales.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b border-soft-border pb-2">
                  <div>
                    <p className="font-semibold">{s.invoice_no}</p>
                    <p className="text-xs text-slate-400">{s.created_at?.slice(0, 10)} · {s.items?.length || 0} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <b>{PKR(s.total)}</b>
                    <button onClick={() => setReceipt(s)} className="text-medical-teal"><Receipt size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </ErpCard>
        </div>
      </div>

      {/* Receipt modal */}
      {receipt && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReceipt(null)} />
          <div className="relative card-premium p-6 w-full max-w-sm print-area text-sm">
            <div className="text-center border-b pb-2 mb-3">
              <p className="font-display font-extrabold text-deep-navy">{HOSPITAL.name}</p>
              <p className="text-xs text-slate-500">Pharmacy Receipt · {HOSPITAL.phone}</p>
            </div>
            <p className="text-xs text-slate-400 mb-2">Invoice: {receipt.invoice_no} · {todayISO()}</p>
            <div className="space-y-1">
              {receipt.items?.map((it: any, i: number) => (
                <div key={i} className="flex justify-between"><span>{it.medicine_name} × {it.qty}</span><span>{PKR(it.price * it.qty)}</span></div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-bold"><span>Total</span><span>{PKR(receipt.total)}</span></div>
            <div className="mt-4 flex gap-2 no-print">
              <button onClick={() => window.print()} className="btn-primary flex-1"><Printer size={15} /> Print</button>
              <button onClick={() => setReceipt(null)} className="btn-ghost">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
