import { IsInt, IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class PostulationRequestDto {
  
  @IsNotEmpty({ message: 'El ID de la petición es obligatorio' })
  @IsInt({ message: 'El ID de la petición debe ser un número entero' })
  idPetition: number;

  @IsNotEmpty({ message: 'Debes incluir una descripción o mensaje' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'El presupuesto es obligatorio' })
  @IsNumber({}, { message: 'El presupuesto debe ser un número' })
  @Min(1, { message: 'El presupuesto debe ser mayor a 0' })
  budget: number;
}