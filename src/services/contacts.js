import ContactsCollection from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import createHttpError from 'http-errors';

const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  isFavourite,
  contactType,
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find({ userId });

  if (isFavourite) {
    contactsQuery.where('isFavourite').equals(isFavourite);
  }
  if (contactType) {
    contactsQuery.where('contactType').equals(contactType);
  }

  const contactsCount = await ContactsCollection.find()
    .merge(contactsQuery)
    .countDocuments();

  const contacts = await contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec();

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts,
    ...paginationData,
  };
};

const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({ _id: contactId, userId });
  return contact;
};

const createContact = async (contactData) => {
  const contact = await ContactsCollection.create(contactData);
  return contact;
};

const updateContact = async (contactId, updateData, userId, options = {}) => {
  const contact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    updateData,
    { new: true, ...options },
  );
  return contact;
};

const upsertContact = async (contactId, contactData) => {
  const { isNew, contact } = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId: contactData.userId },
    { ...contactData, userId: contactData.userId },
    { new: true, upsert: true },
  );
  return { isNew, contact };
};

const deleteContact = async (contactId, userId) => {
  const contact = await ContactsCollection.findOneAndDelete({ _id: contactId, userId });
  return contact;
};

const uploadContactsPhoto = async (contactId, file, userId) => {
  const contact = await getContactById(contactId, userId);
  if (!contact) {
    throw createHttpError(404, 'Contact not found!');
  }

  const photoUrl = await saveFileToCloudinary(file);
  contact.photo = photoUrl;
  await contact.save();

  return contact;
};

export { getAllContacts, getContactById, createContact, updateContact, deleteContact, upsertContact, uploadContactsPhoto };