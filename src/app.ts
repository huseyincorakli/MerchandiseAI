import { ENV } from './config';
import express from 'express';
import cors from 'cors';
import route from './routes/route';

const app = express();
const PORT = ENV.PORT || 3000;


const corsOptions = {
  origin: 'https://merchandiseai.huscor.tech', 
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/v1', route);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});