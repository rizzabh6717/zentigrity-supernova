import mongoose, { Schema, model, models } from 'mongoose';

const WorkerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  assignedRequests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  completedRequests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  createdAt: { type: Date, default: Date.now },
});

export default models.Worker || model('Worker', WorkerSchema);
