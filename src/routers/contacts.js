import { Router } from 'express';
import { getAllContactsController, getContactByIdController, createContactController, updateContactController, deleteContactController, upsertContactController, uploadContactsPhotoController } from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createContactSchema, updateContactSchema } from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

router.get('/', authenticate, ctrlWrapper(getAllContactsController));

router.get('/:contactId', authenticate, isValidId('contactId'), ctrlWrapper(getContactByIdController));

router.post('/', authenticate, upload.single('photo'), validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch('/:contactId', authenticate, upload.single('photo'), validateBody(updateContactSchema), ctrlWrapper(updateContactController));

router.delete('/:contactId', authenticate, isValidId('contactId'), ctrlWrapper(deleteContactController));

export default router;