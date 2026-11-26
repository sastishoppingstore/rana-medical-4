import { useEffect, useState, useMemo } from 'react';
import { Wallet, TrendingDown, Scale, AlertCircle, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, ErpCard, Spinner, Empty, StatusBadge } from './ErpUI';
import { useToast } from '../ui/primitives';
import { PKR, todayISO } from '../../lib/format';

interface Invoice { id: number; invoice_no: string; type: string; total: number; paid: number; balance: number; created_at: string }
interface Expense { id: number; category: string; description: string; amount: number; date: string }
interface Sale { id: number; invoice_no: string; total: number }

export default function Accounts() {
  const toast = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expForm, setExpForm] = useState({ category: 'Salaries', description: '', amount: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [inv, exp, sl] = await Promise.all([api.get('/api/invoices'), api.get('/api/expenses'), api.get('/api/pharmacy-sales')]);
      setInvoices(inv); setExpenses(exp); setSales(sl);
    } catch { toast('Failed to load accounts', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const income = useMemo(() => {
    const invPaid = invoices.reduce((s, i) => s + Number(i.paid || 0), 0);
    const slTotal = sales.reduce((s, x) => s + Number(x.total || 0), 0);
    return { invPaid, slTotal, total: invPaid + slTotal };
  }, [invoices, sales]);

  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const net = income.total - totalExpense;
  const outstanding = invoices.reduce((s, i) => s + Number(i.balance || 0), 0);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach((i) => { map[i.type] = (map[i.type] || 0) + Number(i.paid || 0); });
    return Object.entries(map);
  }, [invoices]);
  const maxType = Math.max(...byType.map(([, v]) => v), 1);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.description.trim() || !expForm.amount) { toast('Enter description and amount', 'error'); return; }
    try {
      const ex = await api.post('/api/expenses', { ...expForm, amount: Number(expForm.amount), date: todayISO() });
      setExpenses((prev) => [ex, ...prev]);
      setExpForm({ category: 'Salaries', description: '', amount: '' });
      toast('Expense recorded', 'success');
    } catch (e: any) { toast(e.message, 'error'); }
  };

  if (loading) return <Spinner label="Loading accounts…" />;

  return (
    <div>
      <PageHeader title="Accounts & Hisab-Kitab" subtitle="Auditable financials — income, expenses and net profit from real records." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ErpCard><p className="text-xs text-slate-400">Total Income</p><p className="font-display text-2xl font-extrabold text-[#a02030]">{PKR(income.total)}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Total Expense</p><p className="font-display text-2xl font-extrabold text-rose-500">{PKR(totalExpense)}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Net Profit</p><p className="font-display text-2xl font-extrabold text-medical-teal">{PKR(net)}</p></ErpCard>
        <ErpCard><p className="text-xs text-slate-400">Outstanding</p><p className="font-display text-2xl font-extrabold text-amber-500">{PKR(outstanding)}</p></ErpCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <ErpCard title="Income by Source" className="lg:col-span-2">
          <div className="space-y-3">
            {byType.length === 0 && <Empty msg="No income recorded yet." />}
            {byType.map(([type, val]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1"><span className="capitalize text-slate-600">{type}</span><span className="font-semibold">{PKR(val)}</span></div>
                <div className="h-2.5 rounded-full bg-ice-mint"><div className="h-2.5 rounded-full bg-gradient-to-r from-medical-teal to-royal-blue" style={{ width: `${(val / maxType) * 100}%` }} /></div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm"><span className="text-slate-600">Pharmacy Sales</span><span className="font-semibold">{PKR(income.slTotal)}</span></div>
            </div>
          </div>
        </ErpCard>

        <ErpCard title="Add Expense">
          <form onSubmit={addExpense} className="space-y-3">
            <select className="input-field" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
              {['Salaries', 'Electricity', 'Medical Supplies', 'Rent', 'Utilities', 'Maintenance', 'Other'].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="input-field" placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
            <input className="input-field" type="number" placeholder="Amount (PKR)" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} />
            <button className="btn-primary w-full"><Plus size={16} /> Record Expense</button>
          </form>
        </ErpCard>

        <ErpCard title="Expense Ledger" className="lg:col-span-2">
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {expenses.length === 0 && <Empty msg="No expenses recorded." />}
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between border border-soft-border rounded-xl p-2.5 text-sm">
                <div>
                  <p className="font-semibold">{e.description}</p>
                  <p className="text-xs text-slate-400">{e.category} · {e.date}</p>
                </div>
                <span className="font-semibold text-rose-500">− {PKR(e.amount)}</span>
              </div>
            ))}
          </div>
        </ErpCard>

        <ErpCard title="Outstanding Invoices">
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {outstanding === 0 && <Empty msg="No outstanding dues." />}
            {invoices.filter((i) => i.balance > 0).map((i) => (
              <div key={i.id} className="flex items-center justify-between border border-soft-border rounded-xl p-2.5 text-sm">
                <div>
                  <p className="font-semibold">{i.invoice_no}</p>
                  <p className="text-xs text-slate-400 capitalize">{i.type}</p>
                </div>
                <span className="font-semibold text-amber-600">{PKR(i.balance)}</span>
              </div>
            ))}
          </div>
        </ErpCard>
      </div>
    </div>
  );
}
