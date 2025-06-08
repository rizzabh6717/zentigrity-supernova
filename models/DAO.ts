import mongoose, { Schema, model, models } from 'mongoose';

const DAOSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: String }], // List of member IDs or emails
  handledRequests: [{ type: Schema.Types.ObjectId, ref: 'Request' }],
  createdAt: { type: Date, default: Date.now },
});

export default models.DAO || model('DAO', DAOSchema);
