import { Body, Controller, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
// import searchReviews from './component/searchReviews';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async searchReview(@Body('message') message: string) {
    return await this.appService.askQuestion(message);
  }
}
