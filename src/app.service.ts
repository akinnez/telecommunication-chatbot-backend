import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { llms } from './component/embedding';
// import searchReviews from './component/searchReviews';

dotenv.config();

@Injectable()
export class AppService {
  constructor() {}

  async askQuestion(question: string): Promise<string> {
    try {
      const response = await llms(question, process.env['Project_APIkey']);
      return response.choices[0].message.content;
      // return new Promise((resolve, reject) => {
      //   searchReviews(process.env['Project_APIkey'], question, resolve, reject);
      // });
    } catch (error) {
      console.error('Error querying the model:', error);
      return 'An error occurred while processing your request.';
    }
  }
}

// processCSV("input.csv", "output/embedded_1k_reviews.csv");
