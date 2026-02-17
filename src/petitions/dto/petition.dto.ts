import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePetitionDto {
  @IsNumber()
  idTypePetition: number; // <--- Cambiado

  @IsNumber()
  idCity: number;         // <--- Cambiado

  @IsString()
  description: string;

  @IsNumber()
  idProfession: number;   // <--- Cambiado

  @IsOptional()
  @IsDateString()
  dateSince?: string;

  @IsOptional()
  @IsDateString()
  dateUntil?: string;

  // React también está mandando imageUrl (Opcional)
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class PetitionResponseDto {
  idPetition: number;
  description: string;
  state: string;
  profession: string;
  city: string;
  typePetition: string;
  customerName: string;
  dateSince: Date;
}