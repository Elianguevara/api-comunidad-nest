import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class StatDTO {
  label: string;
  value: string;
}

export class UserProfileResponseDto {
  id: number;
  providerId?: number; // Opcional, solo si es proveedor
  customerId?: number; // Opcional, solo si es cliente
  name: string;
  lastname: string;
  email: string;
  role: string;
  profileImage: string | null;

  phone?: string;
  address?: string;
  description?: string;
  profession?: string;

  stats: StatDTO[];
}

export class UpdateProfileDto { // Equivalente a UserProfileRequest
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
  @Type(() => Number)
  @IsInt()
  idProfession?: number;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
