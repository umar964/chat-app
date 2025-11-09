import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const friendSchema = new Schema({
    followerId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Friend', friendSchema);