import { createClientAPI } from '@/utils/supabase/supabase-api';
import { NextApiHandler } from 'next';

const handler: NextApiHandler = async (req, res) => {
  const { code } = req.query;

  if (code) {
    const supabase = createClientAPI(req, res);
    await supabase.auth.exchangeCodeForSession(String(code));
  }

  res.redirect('/');
};

export default handler;
