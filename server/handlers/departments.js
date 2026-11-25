import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('departments').select('*').order('id');
      if (error) throw error;
      return res.status(200).json(data);
    }
    const { data, error } = await supabase.from('departments').insert(req.body).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
