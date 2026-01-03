import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getContacts, addContact, deleteContact } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", protect, getContacts);
router.post("/", protect, addContact);
router.delete("/:id", protect, deleteContact);

export default router;
