import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

function admNo() {
  return 'RMH-ADM-' + Math.floor(100000 + Math.random() * 900000);
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
      let q = supabase.from('admissions').select('*').order('id', { ascending: false });
      if (req.query.status) q = q.eq('status', req.query.status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { patient_id, bed_id, ward_id, daily_charge } = req.body;
      if (!patient_id || !bed_id) return res.status(400).json({ error: 'patient_id and bed_id required' });
      const { data, error } = await supabase.from('admissions').insert({
        admission_id: admNo(), patient_id, bed_id, ward_id: ward_id || null,
        daily_charge: daily_charge || 0, status: 'admitted', admission_date: new Date().toISOString().slice(0, 10),
      }).select().single();
      if (error) throw error;
      await supabase.from('beds').update({ status: 'occupied' }).eq('id', bed_id);
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      if (rest.status === 'discharged' && !rest.discharge_date) rest.discharge_date = new Date().toISOString().slice(0, 10);
      const { data: adm } = await supabase.from('admissions').select('bed_id').eq('id', id).single();
      if (adm && rest.status === 'discharged') await supabase.from('beds').update({ status: 'available' }).eq('id', adm.bed_id);
      const { data, error } = await supabase.from('admissions').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
