import ContactsCollection from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER.ASC,
  sortBy = '_id',
  isFavourite,
  contactType,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

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