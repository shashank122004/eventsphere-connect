import Event from "../models/Event.model.js";
import User from "../models/User.model.js";
import { generateCode } from "../utils/generateCode.js";
import { generateQR } from "../utils/generateQR.js";

export const createEvent = async (req, res) => {
  const code = generateCode();
  const link = `${process.env.BASE_URL}/dashboard/join?code=${code}`;
  const qr = await generateQR(link);

  // determine status based on provided date: if date is before today, mark completed
  let status = 'upcoming';
  try {
    if (req.body && req.body.date) {
      const evDate = new Date(req.body.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      evDate.setHours(0,0,0,0);
      if (!isNaN(evDate.getTime()) && evDate < today) status = 'completed';
    }
  } catch (e) {
    // leave default
  }

  const event = await Event.create({
    ...req.body,
    eventCode: code,
    eventLink: link,
    qrCode: qr,
    host: req.user.id,
    status
  });

  await User.findByIdAndUpdate(req.user.id, {
    $push: { hostedEvents: event._id }
  });

  res.json(event);
};

export const joinEvent = async (req, res) => {
  const { code } = req.body;
  const event = await Event.findOne({ eventCode: code });

  if (!event) return res.status(404).json({ message: "Event not found" });
  // prevent the same user from joining twice
  const joiningUser = await User.findById(req.user.id).select('name email');
  const alreadyJoined = event.guests.some(g => {
    // g.user may be an ObjectId or populated object
    try {
      if (!g) return false;
      if (String(g.user) === String(req.user.id)) return true;
      if (g.user && g.user._id && String(g.user._id) === String(req.user.id)) return true;
      if (g.email && joiningUser?.email && String(g.email).toLowerCase() === String(joiningUser.email).toLowerCase()) return true;
    } catch (e) {
      return false;
    }
    return false;
  });
  if (alreadyJoined) return res.status(400).json({ message: 'User already joined this event' });

  // attach user name/email to the guest entry for easier display
  event.guests.push({
    user: req.user.id,
    name: joiningUser?.name || undefined,
    email: joiningUser?.email || undefined,
    joinedAt: new Date()
  });

  await event.save();
  await User.findByIdAndUpdate(req.user.id, {
    $push: { joinedEvents: event._id }
  });

  // populate guest user data for immediate client use
  const populated = await Event.findById(event._id).populate('guests.user', 'name email');
  res.json(populated || event);
};

export const getPublicEvents = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = await Event.find({ 
      isPublic: true, 
      date: { $gte: today } 
    })
      .populate('host', 'name email')
      .populate('guests.user', 'name email')
      .sort({ date: 1 });
    
    res.json(events);
  } catch (err) {
    console.error('getPublicEvents error:', err.message);
    res.status(500).json({ message: 'Failed to fetch public events' });
  }
};



/* EVENT DETAILS PAGE */
export const getEventById = async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("host", "name email")
    .populate("guests.user", "name email");

  if (!event) return res.status(404).json({ message: "Event not found" });

  res.json(event);
};

/* MY EVENTS PAGE */
export const getMyEvents = async (req, res) => {
  // fetch all related events and classify by date (avoid relying solely on stored status)
  const hostedAll = await Event.find({ host: req.user.id });
  const joinedAll = await Event.find({ 'guests.user': req.user.id });

  const today = new Date();
  today.setHours(0,0,0,0);

  const isPast = (e) => {
    try {
      if (!e || !e.date) return false;
      const d = new Date(e.date);
      d.setHours(0,0,0,0);
      return !isNaN(d.getTime()) && d < today;
    } catch { return false; }
  };

  const hosted = hostedAll.filter(e => !isPast(e));
  const joined = joinedAll.filter(e => !isPast(e));

  res.json({ hosted, joined });
};

/* EVENT HISTORY PAGE */
export const getEventHistory = async (req, res) => {
  // fetch all events related to user, then return those that are completed/past
  const eventsAll = await Event.find({
    $or: [
      { host: req.user.id },
      //{ 'guests.user': req.user.id }
    ]
  });

  const today = new Date();
  today.setHours(0,0,0,0);

  const isPast = (e) => {
    try {
      if (!e || !e.date) return false;
      const d = new Date(e.date);
      d.setHours(0,0,0,0);
      return !isNaN(d.getTime()) && d < today;
    } catch { return false; }
  };

  const events = eventsAll.filter(e => e.status === 'completed' || isPast(e));
  res.json(events);
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  // only host can delete
  if (String(event.host) !== String(req.user.id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await Event.findByIdAndDelete(id);

  // remove references from host and any users who had joined
  await User.findByIdAndUpdate(req.user.id, { $pull: { hostedEvents: id } });
  await User.updateMany({ joinedEvents: id }, { $pull: { joinedEvents: id } });

  res.json({ message: 'Event deleted' });
};

export const leaveEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const userId = req.user.id;
  const joiningUser = await User.findById(userId).select('email');

  const before = event.guests.length;
  event.guests = event.guests.filter(g => {
    try {
      if (!g) return true;
      if (String(g.user) === String(userId)) return false;
      if (g.user && g.user._id && String(g.user._id) === String(userId)) return false;
      if (g.email && joiningUser?.email && String(g.email).toLowerCase() === String(joiningUser.email).toLowerCase()) return false;
    } catch (e) {
      return true;
    }
    return true;
  });

  if (event.guests.length === before) return res.status(400).json({ message: 'User not part of this event' });

  await event.save();
  await User.findByIdAndUpdate(userId, { $pull: { joinedEvents: event._id } });

  res.json({ message: 'Left event' });
};