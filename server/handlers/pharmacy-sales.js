import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

function invoiceNo() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `RMH-PH-${y}${m}-${r}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('pharmacy_sales').select('*, pharmacy_sale_items(*)').order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { patient_id, discount, items } = req.body;
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
      let total = 0;
      for (const it of items) total += Number(it.price) * Number(it.qty);
      total = Math.max(0, total - (Number(discount) || 0));
      const ino = invoiceNo();
      const { data: sale, error } = await supabase.from('pharmacy_sales').insert({ invoice_no: ino, patient_id: patient_id || null, total, discount: Number(discount) || 0 }).select().single();
      if (error) throw error;
      for (const it of items) {
        await supabase.from('pharmacy_sale_items').insert({ sale_id: sale.id, medicine_id: it.medicine_id, qty: it.qty, price: it.price });
        const { data: med } = await supabase.from('medicines').select('stock_qty, generic_name, brand_name').eq('id', it.medicine_id).single();
        if (med) await supabase.from('medicines').update({ stock_qty: Math.max(0, (med.stock_qty || 0) - Number(it.qty)) }).eq('id', it.medicine_id);
      }
      await supabase.from('invoices').insert({ invoice_no: ino, patient_id: patient_id || null, type: 'pharmacy', total, paid: total, balance: 0 });
      const { data: full } = await supabase.from('pharmacy_sales').select('*, pharmacy_sale_items(*)').eq('id', sale.id).single();
      return res.status(201).json(full);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
