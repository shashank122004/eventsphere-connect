import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { sendInvites } from '../controllers/invite.controller.js';

const router = express.Router();

router.post('/send', protect, sendInvites);

export default router;