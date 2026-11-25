import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const today = new Date().toISOString().slice(0, 10);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push(d.toISOString().slice(0, 10));
    }
    const [tokens, admissions, invoices, sales, samples, meds, expenses, appointments] = await Promise.all([
      supabase.from('opd_tokens').select('visit_date'),
      supabase.from('admissions').select('status'),
      supabase.from('invoices').select('type, paid, created_at'),
      supabase.from('pharmacy_sales').select('total, created_at'),
      supabase.from('lab_samples').select('status'),
      supabase.from('medicines').select('stock_qty'),
      supabase.from('expenses').select('amount, date'),
      supabase.from('appointments').select('id, patient_name, token, time_slot, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);
    const allTokens = tokens.data || [];
    const allInvoices = invoices.data || [];
    const allSales = sales.data || [];
    const allExpenses = expenses.data || [];

    const opdToday = allTokens.filter((t) => t.visit_date === today).length;
    const ipdActive = (admissions.data || []).filter((a) => a.status === 'admitted').length;
    const pendingLabs = (samples.data || []).filter((s) => s.status === 'collected' || s.status === 'entered').length;
    const lowStock = (meds.data || []).filter((m) => (m.stock_qty ?? 0) <= 10).length;

    const dateOf = (ts) => (ts || '').slice(0, 10);
    const cashRevenue = allInvoices.filter((i) => dateOf(i.created_at) === today).reduce((s, i) => s + Number(i.paid || 0), 0);
    const onlineRevenue = allSales.filter((s) => dateOf(s.created_at) === today).reduce((s, x) => s + Number(x.total || 0), 0);
    const dailyExpense = allExpenses.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount || 0), 0);
    const netProfit = cashRevenue + onlineRevenue - dailyExpense;

    const incomeExpense = days.map((d) => ({
      date: d.slice(5),
      income: allInvoices.filter((i) => dateOf(i.created_at) === d).reduce((s, i) => s + Number(i.paid || 0), 0) + allSales.filter((s) => dateOf(s.created_at) === d).reduce((s, x) => s + Number(x.total || 0), 0),
      expense: allExpenses.filter((e) => e.date === d).reduce((s, e) => s + Number(e.amount || 0), 0),
    }));

    const deptMap = { opd: 'OPD', ipd: 'IPD', pharmacy: 'Pharmacy', lab: 'Laboratory' };
    const deptAgg = {};
    allInvoices.forEach((i) => { const k = deptMap[i.type] || i.type; deptAgg[k] = (deptAgg[k] || 0) + Number(i.paid || 0); });
    const departmentRevenue = Object.entries(deptAgg).map(([name, value]) => ({ name, value }));

    const opdTrend = days.map((d) => ({ date: d.slice(5), count: allTokens.filter((t) => t.visit_date === d).length }));

    return res.status(200).json({
      opdToday, ipdActive, cashRevenue, onlineRevenue, pendingLabs, lowStock, dailyExpense, netProfit,
      incomeExpense, departmentRevenue, opdTrend, recentAppointments: appointments.data || [],
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
