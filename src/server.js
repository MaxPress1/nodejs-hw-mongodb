import express from "express";
import pino from "pino-http";
import cors from "cors";

import { getEnvVar } from "./utils/getEnvVar.js";
import contactsService from "./services/contacts.js";

const PORT = getEnvVar("PORT", 3000);

const setupServer = () => {
  const app = express();

  app.use(cors());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/contacts', async (req, res) => {
    const contacts = await contactsService.getAllContacts();
    res.json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  });

  app.get('/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params;
    const contact = await contactsService.getContactById(contactId);
    if (!contact) {
      res.status(404).json({
        status: 404,
        message: `Contact with id ${contactId} not found!`,
      });
    }
    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  });

    app.use((req, res) => {
      res.status(404).json({
        message: 'Route not found!',
        status: 404,
      });
    });

    app.use('/', (err, req, res, next) => {
      res.status(500).json({
        status: 500,
        message: 'Oops error happened in application!',
        error: err.message,
      });
    });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default setupServer;