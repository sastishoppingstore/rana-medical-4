import { useEffect, useState } from 'react';
import { Users, BedDouble, Wallet, Smartphone, FlaskConical, PackageX, TrendingUp, Activity } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, KpiCard, ErpCard, Spinner, StatusBadge } from './ErpUI';
import { PKR } from '../../lib/format';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/stats').then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (!stats) return <div className="text-center text-slate-400 py-12">Failed to load dashboard data.</div>;

  const maxIE = Math.max(...stats.incomeExpense.map((d: any) => Math.max(d.income, d.expense)), 1);
  const maxDept = Math.max(...stats.departmentRevenue.map((d: any) => d.value), 1);

  return (
    <div>
      <PageHeader title="Executive Dashboard" subtitle="Real-time hospital performance — all figures derived from live database records." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Today's OPD" value={stats.opdToday} sub="patients registered" Icon={Users} />
        <KpiCard label="Active IPD" value={stats.ipdActive} sub="in-house patients" Icon={BedDouble} accent="from-royal-blue to-sky-500" />
        <KpiCard label="Cash Revenue" value={PKR(stats.cashRevenue)} sub="today" Icon={Wallet} accent="from-emerald-500 to-teal-500" />
        <KpiCard label="Online Revenue" value={PKR(stats.onlineRevenue)} sub="today" Icon={Smartphone} accent="from-violet-500 to-purple-500" />
        <KpiCard label="Pending Labs" value={stats.pendingLabs} sub="reports to authorize" Icon={FlaskConical} accent="from-amber-500 to-orange-500" />
        <KpiCard label="Low Stock" value={stats.lowStock} sub="medicine alerts" Icon={PackageX} accent="from-rose-500 to-red-500" />
        <KpiCard label="Daily Expense" value={PKR(stats.dailyExpense)} sub="today" Icon={TrendingUp} accent="from-slate-500 to-slate-700" />
        <KpiCard label="Net Profit" value={PKR(stats.netProfit)} sub="today (income − expense)" Icon={Activity} accent="from-teal-500 to-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <ErpCard title="Daily Income vs Expense (7 days)" className="lg:col-span-2">
          <div className="space-y-3">
            {stats.incomeExpense.map((d: any, i: number) => (
              <div key={i} className="grid grid-cols-[60px_1fr_1fr] items-center gap-3 text-xs">
                <span className="text-slate-400">{d.date}</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${(d.income / maxIE) * 100}%` }} />
                  <span className="text-slate-500">{PKR(d.income)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 rounded-full bg-rose-400" style={{ width: `${(d.expense / maxIE) * 100}%` }} />
                  <span className="text-slate-500">{PKR(d.expense)}</span>
                </div>
              </div>
            ))}
          </div>
        </ErpCard>

        <ErpCard title="Department Revenue">
          <div className="space-y-3">
            {stats.departmentRevenue.map((d: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600">{d.name}</span><span className="font-semibold">{PKR(d.value)}</span></div>
                <div className="h-2 rounded-full bg-ice-mint"><div className="h-2 rounded-full bg-gradient-to-r from-medical-teal to-royal-blue" style={{ width: `${(d.value / maxDept) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </ErpCard>

        <ErpCard title="OPD Trend (7 days)" className="lg:col-span-2">
          <div className="flex items-end gap-2 h-32">
            {stats.opdTrend.map((d: any, i: number) => {
              const max = Math.max(...stats.opdTrend.map((x: any) => x.count), 1);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-medical-teal to-royal-blue" style={{ height: `${(d.count / max) * 100}%` }} />
                  <span className="text-[10px] text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
        </ErpCard>

        <ErpCard title="Recent Appointments">
          <div className="space-y-2">
            {stats.recentAppointments.length === 0 && <p className="text-sm text-slate-400">No appointments yet.</p>}
            {stats.recentAppointments.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b border-soft-border pb-2">
                <div>
                  <p className="font-semibold text-deep-navy">{a.patient_name}</p>
                  <p className="text-xs text-slate-400">Token #{a.token} · {a.time_slot}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </ErpCard>
      </div>
    </div>
  );
}
