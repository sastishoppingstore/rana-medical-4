import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

function ref(date) {
  const d = new Date(date);
  const y = d.getFullYear().toString().slice(2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `RMH-APT-${y}${m}${day}-${r}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const user = await verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      let q = supabase.from('appointments').select('*').order('created_at', { ascending: false });
      if (req.query.status) q = q.eq('status', req.query.status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { patient_name, mobile, department_id, doctor_id, appointment_date, time_slot } = req.body;
      if (!patient_name || !mobile || !appointment_date) return res.status(400).json({ error: 'Missing required fields' });
      const { count } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', appointment_date);
      const token = (count || 0) + 1;
      const { data, error } = await supabase.from('appointments').insert({
        patient_name, mobile, department_id: department_id || null, doctor_id: doctor_id || null,
        appointment_date, time_slot: time_slot || null, token, reference: ref(appointment_date), status: 'confirmed',
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const user = await verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('appointments').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
