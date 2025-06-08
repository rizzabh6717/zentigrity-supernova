import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';
import multer from 'multer';
import path from 'path';
import type { Express } from 'express';

// Disable body parsing, let multer handle it
export const config = { api: { bodyParser: false } };

// Multer storage configuration
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!') as any, false);
    }
    cb(null, true);
  },
});

// Helper to run multer middleware
const runMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) => {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

export default async function handler(
  req: NextApiRequest & { files?: Express.Multer.File[] },
  res: NextApiResponse
) {
  await dbConnect();

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.array('image'));
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message || 'Upload error' });
    }

    const { title, description, category, address, landmark } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const files = req.files || [];
    const images = files.map((file: any) => `/uploads/${file.filename}`);

    const requestDoc = new RequestModel({
      title,
      description,
      category,
      address,
      landmark,
      images,
    });
    await requestDoc.save();
    return res.status(201).json(requestDoc);
  }

  if (req.method === 'GET') {
    const { status, citizen, worker, dao } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (citizen) filter.citizen = citizen;
    if (worker) filter.worker = worker;
    if (dao) filter.dao = dao;
    const requests = await RequestModel.find(filter)
      .populate('citizen', 'name email')
      .populate('worker', 'name email')
      .populate('dao', 'name');
    return res.status(200).json(requests);
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
