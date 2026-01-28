import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import inviteRoutes from "./routes/invite.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/invites", inviteRoutes);

export default app;
