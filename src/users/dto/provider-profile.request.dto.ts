import { IsNotEmpty, IsInt, IsString, IsArray, IsOptional } from 'class-validator';

export class ProviderProfileRequestDto {
  @IsNotEmpty({ message: 'La profesión es obligatoria' })
  @IsInt()
  idProfession: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray({ message: 'Debes seleccionar al menos una ciudad' })
  @IsNotEmpty({ message: 'Debes seleccionar al menos una ciudad' })
  cityIds: number[];
}