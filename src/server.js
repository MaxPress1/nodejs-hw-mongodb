import express from "express";
import pino from "pino-http";
import cors from "cors";
import cookieParser from "cookie-parser";

import { getEnvVar } from "./utils/getEnvVar.js";
import contactsRouter from "./routers/contacts.js";
import authRouter from "./routers/auth.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authenticate } from "./middlewares/authenticate.js";
import { setupSwagger } from "./middlewares/setupSwagger.js";

const PORT = getEnvVar("PORT", 3000);

const setupServer = () => {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );
  app.use('/api-docs', setupSwagger());
  app.use('/auth', authRouter);
  app.use('/contacts', authenticate, contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default setupServer;