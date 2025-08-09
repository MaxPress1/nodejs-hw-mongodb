import ContactsCollection from '../db/models/contacts.js';

const getAllContacts = async () => {
    const contacts = await ContactsCollection.find();
    return contacts;
};

const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

const createContact = async (contactData) => {
  const contact = await ContactsCollection.create(contactData);
  return contact;
};

const updateContact = async (contactId, updateData, options = {}) => {
  const contact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId },
    updateData,
    { new: true, ...options },
  );
  return contact;
};

const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findOneAndDelete({ _id: contactId });
  return contact;
};

export { getAllContacts, getContactById, createContact, updateContact, deleteContact };