import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true
    },

    phone: {
      type: String
    },

    // Optional: only for password-based users
    password: {
      type: String,
      default: null
    },

    // Core auth flags
    emailVerified: {
      type: Boolean,
      default: false
    },

    // Google OAuth
    googleId: {
      type: String,
      default: null
    },

    // Event relations (unchanged)
    hostedEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event" }
    ],

    joinedEvents: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Event" }
    ],

    // Optional but useful
    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
