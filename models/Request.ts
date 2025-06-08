import mongoose, { Schema, model, models } from 'mongoose';

const RequestSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  citizen: { type: Schema.Types.ObjectId, ref: 'Citizen' },
  worker: { type: Schema.Types.ObjectId, ref: 'Worker' },
  dao: { type: Schema.Types.ObjectId, ref: 'DAO' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Request || model('Request', RequestSchema);
