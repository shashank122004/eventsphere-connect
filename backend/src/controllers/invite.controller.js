import nodemailer from "nodemailer";
import Contact from "../models/Contact.model.js";

export const sendInvites = async (req, res) => {
  const { event, contacts } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  for (let c of contacts) {
    await transporter.sendMail({
      to: c.email,
      subject: `Invitation to ${event.title}`,
      html: `<p>Join Event: <a href="${event.eventLink}">Click here</a></p>`
    });
  }

  res.json({ message: "Invitations sent" });
};
