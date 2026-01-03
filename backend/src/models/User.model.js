import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  hostedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
