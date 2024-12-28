import { Schema, model } from 'mongoose';

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    threadId: { type: Schema.Types.ObjectId, ref: 'Thread', required: false },
    createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = model('Notification', NotificationSchema);
export default Notification;
