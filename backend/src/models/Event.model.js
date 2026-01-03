import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  location: String,
  isPublic: Boolean,
  maxGuests: Number,

  eventCode: String,
  eventLink: String,

  host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  guests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    email: String,
    joinedAt: Date
  }],

  status: { type: String, default: "upcoming" }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
