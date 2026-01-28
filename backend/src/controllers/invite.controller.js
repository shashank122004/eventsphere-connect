import nodemailer from 'nodemailer';


export const sendInvites = async (req, res) => {
  try {
    const { event, contacts } = req.body;

    // Validate input
    if (!event || !event.title || !event.eventLink) {
      return res.status(400).json({ message: 'Event data is incomplete' });
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ message: 'Contacts array is required and cannot be empty' });
    }

    // Validate all contacts have valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let c of contacts) {
      if (!c.email || !emailRegex.test(c.email)) {
        return res.status(400).json({ message: `Invalid email format: ${c.email}` });
      }
    }

    // Create transporter using shared config
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true' ? true : false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send invitations
    for (let c of contacts) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: c.email,
          subject: `Invitation to ${event.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">You're Invited!</h2>
                <p style="color: #666; font-size: 16px; margin-bottom: 10px;">Hi ${c.name || 'there'},</p>
                <p style="color: #666; font-size: 16px; margin-bottom: 20px;">You've been invited to join <strong>${event.title}</strong></p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0; color: #666;"><strong>Event:</strong> ${event.title}</p>
                  ${event.date ? `<p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${event.date}</p>` : ''}
                  ${event.location ? `<p style="margin: 5px 0; color: #666;"><strong>Location:</strong> ${event.location}</p>` : ''}
                </div>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${event.eventLink}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Join Event</a>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">Or copy and paste this link in your browser:</p>
                <p style="color: #007bff; font-size: 12px; word-break: break-all;">${event.eventLink}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Eventify Team</p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error(`Failed to send invite to ${c.email}:`, err.message);
      }
    }

    res.json({ message: `Invitations sent to ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}` });
  } catch (err) {
    console.error('Send invites error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to send invites' });
  }
};