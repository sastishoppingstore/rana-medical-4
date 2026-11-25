import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const user = await verifyToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method === 'GET') {
      let q = supabase.from('opd_tokens').select('*').order('id', { ascending: false });
      if (req.query.status) q = q.eq('status', req.query.status);
      if (req.query.visit_date) q = q.eq('visit_date', req.query.visit_date);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { patient_id, doctor_id, department_id } = req.body;
      if (!patient_id) return res.status(400).json({ error: 'patient_id required' });
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase.from('opd_tokens').select('*', { count: 'exact', head: true }).eq('visit_date', today);
      const token_no = (count || 0) + 1;
      const { data, error } = await supabase.from('opd_tokens').insert({
        patient_id, doctor_id: doctor_id || null, department_id: department_id || null,
        token_no, visit_date: today, status: 'waiting',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('opd_tokens').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
