import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import  connectDB  from "./src/config/db.js";
import client from "./src/config/redis.js"

const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
    client.connect();
    console.log("connected to redis db");
  } catch (err) {
    console.error('Failed to start server, DB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }
};

start();