import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createEvent, joinEvent, getPublicEvents, deleteEvent ,leaveEvent} from "../controllers/event.controller.js";
import {
  getEventById,
  getMyEvents,
  getEventHistory
} from "../controllers/event.controller.js";

const router = express.Router();
router.post("/create", protect, createEvent);
router.post("/join", protect, joinEvent);
router.get("/public", protect, getPublicEvents);
router.get("/:id", protect, getEventById);
router.get("/user/my-events", protect, getMyEvents);
router.get("/user/history", protect, getEventHistory);
router.post('/:id/leave', protect, leaveEvent);
router.delete('/:id', protect, deleteEvent);

export default router;

