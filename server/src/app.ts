import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import routes from './routes';
import { attachUser } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errorHandler';

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;