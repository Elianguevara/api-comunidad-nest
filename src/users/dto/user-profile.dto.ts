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
  name?: string;
  lastname?: string;
  phone?: string;
  description?: string;
  idProfession?: number;
  profileImage?: string;
}