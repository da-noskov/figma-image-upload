import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { frames } = req.body;
  const filename = `frame-data-${Date.now()}.json`;

  const { error } = await supabase.storage
    .from('figma-images')
    .upload(filename, JSON.stringify(frames), { contentType: 'application/json' });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const publicUrl = supabase.storage.from('figma-images').getPublicUrl(filename).data.publicUrl;

  return res.status(200).json({ message: 'Frame data saved', url: publicUrl });
}
