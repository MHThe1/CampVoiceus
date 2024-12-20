import mongoose from 'mongoose';
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // RSVP List
    createdAt: { type: Date, default: Date.now },
  });
  
  const Event = mongoose.model("Event", EventSchema);
  
  export default Event;
  