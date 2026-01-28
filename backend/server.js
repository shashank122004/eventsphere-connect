import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import  connectDB  from "./src/config/db.js";
import path from "path";
import express from "express";

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});


const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error('Failed to start server, DB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

start();