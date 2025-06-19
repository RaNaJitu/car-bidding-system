import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt.guard';
import { Reflector } from '@nestjs/core';
import { JwtBlacklistGuard } from './auth/jwt-blacklist.guard';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis/redis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that are not in the DTO
      forbidNonWhitelisted: true, // throws error if unknown properties exist
      transform: true, // automatically transform payloads to DTO instances
    }),
  );

  // ✅ Swagger config
  const config = new DocumentBuilder()
  .setTitle('Auction API')
  .setDescription('Car Auction System')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    },
    'access-token',
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  // app.useGlobalGuards(new JwtAuthGuard());

  app.enableCors({
  origin: '*',
  credentials: true,
});

// If Swagger UI loads in browser but tokens aren't sent, you might need to ensure CORS headers are correctly set:
  SwaggerModule.setup('api', app, document);


  // app.useGlobalGuards(app.get(JwtBlacklistGuard));
//  const reflector = app.get(Reflector);
  const jwtService = app.get(JwtService);
  const redisService = app.get(RedisService);

  app.useGlobalGuards(
    new JwtAuthGuard(reflector),
    new JwtBlacklistGuard(jwtService, redisService, reflector)
  );

  await app.listen(3000);
  console.log(`🚀 Server running at http://localhost:3000`);
}
bootstrap();







