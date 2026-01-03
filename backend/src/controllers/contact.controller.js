import Contact from "../models/Contact.model.js";

export const getContacts = async (req, res) => {
  const contacts = await Contact.find({ user: req.user.id });
  res.json(contacts);
};

export const addContact = async (req, res) => {
  const contact = await Contact.create({
    ...req.body,
    user: req.user.id
  });
  res.status(201).json(contact);
};

export const deleteContact = async (req, res) => {
  await Contact.deleteOne({ _id: req.params.id, user: req.user.id });
  res.json({ message: "Contact deleted" });
};
