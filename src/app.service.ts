import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AppService {
  constructor() {}

  async askQuestion(question: string): Promise<string> {
    try {
    } catch (error) {
      console.error('Error querying the model:', error);
      return 'An error occurred while processing your request.';
    }
  }
}

// processCSV("input.csv", "output/embedded_1k_reviews.csv");
