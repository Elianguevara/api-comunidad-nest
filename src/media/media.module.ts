import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { StorageService } from './storage.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  controllers: [MediaController],
  providers: [CloudinaryProvider, StorageService],
  exports: [StorageService], // Lo exportamos por si otros servicios necesitan subir fotos
})
export class MediaModule {}