import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://telecommunication-chatbot-frontend.vercel.app',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });
  await app.listen(process.env['PORT'] || 10000);
}
bootstrap();
