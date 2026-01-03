import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
