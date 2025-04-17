import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env['Project_APIkey'];

export const model = new ChatOpenAI({
  openAIApiKey: apiKey,
  model: 'gpt-3.5-turbo',
  maxRetries: 3,
  timeout: 10000,
  n: 1,
  temperature: 0.7,
});

export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: apiKey,
  model: 'text-embedding-3-small',
});
