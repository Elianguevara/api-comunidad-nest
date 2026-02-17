import { IsNotEmpty, IsInt, IsString, MinLength, IsOptional } from 'class-validator';

export class PetitionRequestDto {
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description: string;

  @IsNotEmpty({ message: 'Debes seleccionar un tipo de petición' })
  @IsInt()
  idTypePetition: number;

  @IsNotEmpty({ message: 'Debes seleccionar una profesión requerida' })
  @IsInt()
  idProfession: number;

  @IsNotEmpty({ message: 'Debes seleccionar la ciudad donde se realizará el trabajo' })
  @IsInt()
  idCity: number;

  @IsOptional()
  dateUntil?: string; // En React usualmente llega como string ISO (YYYY-MM-DD)

  @IsOptional()
  @IsString()
  imageUrl?: string;
}