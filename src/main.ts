import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Virtual Mail Hub')
    .setDescription('The Virtual Mail Hub API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath =
    process.env.NODE_ENV === 'production'
      ? 'api/docs?v=' + new Date().getTime()
      : 'api/docs';

  SwaggerModule.setup(swaggerPath, app, document);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.SERVER_PORT || 5001);
}
bootstrap();
