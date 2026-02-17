import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

// Equivalente a PetitionRequest.java
export class CreatePetitionDto {
  @IsNumber()
  typePetitionId: number;

  @IsNumber()
  cityId: number;

  @IsString()
  description: string;

  @IsNumber()
  professionId: number;

  @IsOptional()
  @IsDateString()
  dateSince?: string;

  @IsOptional()
  @IsDateString()
  dateUntil?: string;
}

// Equivalente a PetitionResponse.java (Simplificado por ahora)
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