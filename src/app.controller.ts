import { Body, Controller, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async chat(@Body('message') message: string) {
    return this.appService.askQuestion(message);
  }
}
