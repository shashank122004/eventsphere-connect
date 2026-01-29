import SibApiV3Sdk from "sib-api-v3-sdk";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendInvites = async (req, res) => {
  try {
    const { event, contacts } = req.body;

    // Validate input
    if (!event || !event.title || !event.eventLink) {
      return res.status(400).json({ message: "Event data is incomplete" });
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ message: "Contacts array cannot be empty" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const c of contacts) {
      if (!c.email || !emailRegex.test(c.email)) {
        return res.status(400).json({ message: `Invalid email: ${c.email}` });
      }
    }

    // Send invites (sequential – safe for OTP / small batches)
    for (const c of contacts) {
      try {
        await apiInstance.sendTransacEmail({
          to: [{ email: c.email, name: c.name || "Guest" }],
          sender: {
            email: process.env.EMAIL_FROM,
            name: "Eventify",
          },
          subject: `Invitation to ${event.title}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>You're Invited!</h2>
              <p>Hi ${c.name || "there"},</p>
              <p>You’re invited to <strong>${event.title}</strong></p>

              <p><strong>Event:</strong> ${event.title}</p>
              ${event.date ? `<p><strong>Date:</strong> ${event.date}</p>` : ""}
              ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ""}

              <p style="margin: 20px 0;">
                <a href="${event.eventLink}" 
                   style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
                   Join Event
                </a>
              </p>

              <p style="font-size:12px;color:#888;">Eventify Team</p>
            </div>
          `,
        });
      } catch (err) {
        console.error(`❌ Failed invite → ${c.email}`, err.response?.body || err);
      }
    }

    res.json({
      message: `Invitations sent to ${contacts.length} contact${contacts.length > 1 ? "s" : ""}`,
    });
  } catch (err) {
    console.error("Send invites error:", err);
    res.status(500).json({ message: "Failed to send invitations" });
  }
};
