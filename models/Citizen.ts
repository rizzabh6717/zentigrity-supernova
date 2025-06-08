import mongoose, { Schema, model, models } from 'mongoose';

const CitizenSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  grievances: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  createdAt: { type: Date, default: Date.now },
});

export default models.Citizen || model('Citizen', CitizenSchema);
