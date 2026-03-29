import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '../.env') });
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sparqlProxy from './sparql-proxy.js';
import { grantMatchRouter } from './grant-match-route.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(sparqlProxy);
app.use('/api/grant-match', grantMatchRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// In production, serve the built React frontend
const clientDistPath = resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => {
  res.sendFile(resolve(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CORDIS Explorer server running on port ${PORT}`);
});
