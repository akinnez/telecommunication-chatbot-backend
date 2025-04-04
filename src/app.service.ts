import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import searchReviews from './component/searchReviews';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class AppService {
  private loader: CSVLoader;
  constructor() {
    this.loader = new CSVLoader(join(__filename, '..', '..', 'faq_data.csv'));
  }

  async askQuestion(question: string) {
    const document = await this.loader.load();

    try {
      return searchReviews(document, process.env['Project_APIkey'], question);
    } catch (error) {
      console.error('Error querying the model:', error);
      return 'An error occurred while processing your request.';
    }
  }
}
