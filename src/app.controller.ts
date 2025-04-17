import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('chat')
  async chat(@Body() payload: { message: string; threadId: string }) {
    return this.appService.askQuestion(payload);
  }
}
