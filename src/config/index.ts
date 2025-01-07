import { config } from 'dotenv';

config();

const TOGETHER_AI_API_KEY = process.env.TOGETHER_AI_API_KEY;
if (!TOGETHER_AI_API_KEY) {
    throw new Error('TOGETHER_AI_API_KEY is not set in environment variables');
}

export const ENV = {
    TOGETHER_AI_API_KEY,
    PORT: process.env.PORT || 3000
};