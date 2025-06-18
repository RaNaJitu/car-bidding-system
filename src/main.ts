// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Optional: set global prefix for all routes
//   app.setGlobalPrefix('api');

//   // Optional: enable CORS if you are accessing API from frontend or other services
//   app.enableCors();

//   // Start listening on port 3000 or from env variable
//   const port = process.env.PORT || 3000;
//   await app.listen(port);
//   console.log(`Application is running on: http://localhost:${port}`);
// }
// bootstrap();


// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3000, ()=>{
//     console.log(`server is srated port: ${3000}`)
//   });
// }
// bootstrap();




// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { RoutesResolver } from '@nestjs/core/router/routes-resolver';
// import { ModuleRef } from '@nestjs/core';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.enableCors();

  
//   await app.listen(3000);

//   console.log(`🚀 Server running on http://localhost:3000`);

//   // Log all registered routes using RoutesResolver
//   const moduleRef = app.select(AppModule);
//   const routesResolver = moduleRef.get(RoutesResolver, { strict: false });

//   const routerExplorer = (routesResolver as any).routerExplorer;
//   const path = ''; // Base path
//   const appRoutes = routerExplorer.explore(AppModule, moduleRef, path);

//   console.log('📚 Registered routes:');
//   for (const route of appRoutes) {
//     console.log(`${route.requestMethod.toUpperCase()} ${route.path}`);
//   }

//   const config = new DocumentBuilder()
//   .setTitle('Car Bidding API')
//   .setDescription('Live bidding system')
//   .setVersion('1.0')
//   .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('docs', app, document);
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

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
    .setTitle('Car Bidding System')
    .setDescription('API documentation for live car auction bidding system')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  

  await app.listen(3000);
  console.log(`🚀 Server running at http://localhost:3000`);


  

  // // ✅ Manually log known routes (safe and simple)
  // console.log(`📚 Manually documented routes:`);
  // console.log(`GET /auctions/:id/highestBid`);
  // console.log(`POST /bids`);
  // console.log(`GET /users`);
  // console.log(`WebSocket: connect → joinAuction → bidUpdate`);
}
bootstrap();







