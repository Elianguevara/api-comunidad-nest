import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class StartConversationRequestDto {
  @IsNotEmpty({ message: 'El ID de la petición es obligatorio' })
  @IsInt()
  petitionId: number;

  @IsNotEmpty({ message: 'El ID del proveedor es obligatorio' })
  @IsInt()
  providerId: number;
}

export class MessageRequestDto {
  @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
  @IsString()
  content: string;
}