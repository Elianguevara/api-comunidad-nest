import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

// Coincide con UpdateProfileData
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  lastname?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  idProfession?: number;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

// Coincide con UpdateProviderProfileData
export class UpdateProviderProfileDto {
  @IsNumber()
  idProfession: number;

  @IsString()
  description: string;

  @IsArray()
  @IsNumber({}, { each: true })
  cityIds: number[];
}