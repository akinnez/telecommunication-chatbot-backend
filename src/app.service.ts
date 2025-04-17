import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import searchReviews from './component/searchReviews';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class AppService {
  private loader: CSVLoader;
  private document: any;
  constructor() {
    this.loader = new CSVLoader(join(__filename, '..', '..', 'faq_data.csv'));
    this.loadDocs(this.loader);
  }
  async loadDocs(loader: CSVLoader) {
    const docs = await loader.load();
    this.document = docs.map((doc) => ({
      ...doc,
      answer: doc['pageContent'].replace(/\\n/g, '\n'), // normalize if needed
    }));
  }
  async askQuestion(payload: { message: string; threadId: string }) {
    try {
      return await searchReviews(
        this.document,
        process.env['Project_APIkey'],
        payload.message,
        payload.threadId,
      );
    } catch (error) {
      console.error('Error querying the model:', error);
      return 'An error occurred while processing your request.';
    }
  }
}
