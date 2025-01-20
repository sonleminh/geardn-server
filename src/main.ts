import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT');
  const apiPrefix = configService.get<string>('API_PREFIX');

  const config = new DocumentBuilder()
    .setTitle('Median')
    .setDescription('The Median API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const whiteList = configService
    .get<string>('WHITE_LIST')
    ?.toString()
    .split(',')
    .map((val) => val.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, HEAD, PUT, POST, DELETE, OPTIONS, PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.setGlobalPrefix(apiPrefix);
  await app.listen(port);
}
bootstrap();