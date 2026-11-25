import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

function reportNo() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `RMH-LAB-${y}${m}-${r}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    // Public verification lookup
    if (req.method === 'GET' && req.query.ref && req.query.mobile) {
      const { data, error } = await supabase.from('lab_reports').select('*').eq('report_no', req.query.ref).eq('mobile', req.query.mobile).eq('authorized', true).single();
      if (error || !data) return res.status(404).json({ error: 'Report not found' });
      return res.status(200).json(data);
    }
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('lab_reports').select('*').order('id', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { data, error } = await supabase.from('lab_reports').insert({ ...req.body, report_no: reportNo(), authorized: true, published_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('lab_reports').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
