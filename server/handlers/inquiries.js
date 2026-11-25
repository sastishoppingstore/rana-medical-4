import supabase from './db-client.js';
import { verifyToken } from './_auth.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const user = await verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, email, phone, message } = req.body;
      if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
      const { data, error } = await supabase.from('inquiries').insert({ name, email, phone, message, status: 'open' }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const user = await verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...rest } = req.body;
      const { data, error } = await supabase.from('inquiries').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
