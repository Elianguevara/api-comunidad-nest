import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';

@Controller('media')
export class MediaController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // "file" debe coincidir con el @RequestParam de Java
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const url = await this.storageService.uploadFile(file);
      return { url }; // Devolvemos el JSON que React espera: { url: "..." }
    } catch (error) {
      throw new BadRequestException('Fallo al subir archivo a Cloudinary.');
    }
  }
}