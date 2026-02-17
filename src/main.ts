// 1. IMPORTANTE: Esto debe ir en la primera línea para que todo Node use la hora de Argentina
process.env.TZ = 'America/Argentina/Buenos_Aires';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 2. Prefijo global 
  app.setGlobalPrefix('api');

  // 3. CORS: Configuración recomendada para desarrollo y producción
  // origin: true permite que se adapte automáticamente al origen de React
  app.enableCors({
    origin: "*", 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. Pipes de validación: Transform true es vital para que los IDs de los DTOs
  // se conviertan de string a number automáticamente.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Lanza error si envían campos que no están en el DTO
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 8080;

  await app.listen(port);
  
  // Imprimimos la hora actual del servidor para verificar el fix en la consola
  console.log(`🚀 Backend corriendo en: http://localhost:${port}/api`);
  console.log(`🕒 Hora local del servidor: ${new Date().toLocaleString()}`);
}
bootstrap();