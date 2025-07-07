import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const fileName = req.headers['x-file-name'] || 'figma-image.png';
  
  // Загружаем файл из base64
  const buffer = Buffer.from(file, 'base64');

  const { data, error } = await supabase.storage
    .from('figma-images')
    .upload(fileName, buffer, { upsert: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const publicUrl = supabase.storage
    .from('figma-images')
    .getPublicUrl(fileName).data.publicUrl;

  return res.status(200).json({ url: publicUrl });
}
