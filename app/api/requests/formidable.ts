import { IncomingForm } from 'formidable';
import { NextApiRequest } from 'next';
import { promisify } from 'util';

export const parseForm = async (req: any): Promise<{ fields: any; files: any }> => {
  const form = new IncomingForm({ multiples: true, keepExtensions: true });
  return await promisify(form.parse)(req);
};

export const config = {
  api: {
    bodyParser: false,
  },
};
