import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Importación de todos tus módulos ---
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MetadataModule } from './metadata/metadata.module';
import { PetitionsModule } from './petitions/petitions.module';
import { PostulationsModule } from './postulations/postulations.module'; 
import { GradesModule } from './grades/grades.module'; 
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    // 1. Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    // 2. Configurar TypeORM con MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        
        // APAGADO para evitar conflictos con la base de datos compartida
        // y prevenir el error "Duplicate entry '' for key"
        synchronize: false, 
        
        timezone: '-03:00', // Fuerza a Mendoza/Argentina
      }),
    }),
    // 3. Registrar los módulos de la aplicación
    UsersModule,
    AuthModule,
    MetadataModule,
    PetitionsModule,
    PostulationsModule, 
    GradesModule,       
    ChatModule,
    NotificationsModule,
    MediaModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}