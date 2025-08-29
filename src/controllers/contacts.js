import createHttpError from 'http-errors';
import { getAllContacts, getContactById, createContact, updateContact, deleteContact, upsertContact, uploadContactsPhoto } from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

const getAllContactsController = async (req, res) => {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortOrder, sortBy } = parseSortParams(req.query);
    const { isFavourite, contactType } = parseFilterParams(req.query);
    const contacts = await getAllContacts({
     page,
     perPage,
     sortBy,
     sortOrder,
     isFavourite,
     contactType,
     userId: req.user._id,
   });

    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
};

const getContactByIdController = async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId, req.user._id);
    if (!contact) {
      throw createHttpError(404, `Contact with id ${contactId} not found!`);
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
};

const createContactController = async (req, res) => {
    const contactData = { ...req.body, userId: req.user._id };
  
    if (req.file) {
    contactData.photo = await saveFileToCloudinary(req.file);
  }

    const contact = await createContact(contactData);

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
};

const updateContactController = async (req, res) => {
    const { contactId } = req.params;
    const updateData = { ...req.body };

    const contact = await updateContact(contactId, updateData, req.user._id);
    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: contact,
    });
};

const deleteContactController = async (req, res) => {
    const { contactId } = req.params;
    const contact = await deleteContact(contactId, req.user._id);
    if (!contact) {
      throw createHttpError(404, 'Contact not found');
    }

    res.status(204).send();
};

const upsertContactController = async (req, res) => {
  const { contactId } = req.params;
  const contactData = { ...req.body, userId: req.user._id };

  if (req.file) {
    contactData.photo = await saveFileToCloudinary(req.file);
  }

  const { isNew, contact } = await upsertContact(contactId, contactData);

  const status = isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: `Successfully upserted a contact!`,
    data: contact,
  });
};

const uploadContactsPhotoController = async (req, res) => {
  const { contactId } = req.params;
  
  if (!req.file) {
    throw createHttpError(400, 'Photo file is required');
  }

  const contact = await uploadContactsPhoto(contactId, req.file, req.user._id);
  
  res.json({
    status: 200,
    message: 'Successfully uploaded a photo for a contact!',
    data: contact,
  });
};

export { getAllContactsController, getContactByIdController, createContactController, updateContactController, deleteContactController, upsertContactController, uploadContactsPhotoController };