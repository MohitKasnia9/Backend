import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:4200', // Update to match your frontend URL
    credentials: true,
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  // Add session middleware
  app.use(
    session({
      secret: 'yourSecretKey', // Replace with environment variable for security
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
        maxAge: 3600000, // Session expiration time (1 hour)
      },
    }),
  );

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}

bootstrap();
