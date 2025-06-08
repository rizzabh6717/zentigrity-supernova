import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import RequestModel from '@/models/Request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }
    try {
      const updated = await RequestModel.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Request not found' });
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update status' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
