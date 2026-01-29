import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import inviteRoutes from "./routes/invite.routes.js";

const app = express();
app.use(express.json());
//app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/invites", inviteRoutes);

const corsoptions = {
  origin: [
    "http://localhost:3000",
    "https://eventsphere-connect.onrender.com" // add frontend prod URL
  ],
  Credentials: true,
};
app.use(cors(corsoptions));

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});



export default app;
