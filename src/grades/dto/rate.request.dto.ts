import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class RateRequestDto {
  @IsNotEmpty({ message: 'El ID del objetivo (Usuario a calificar) es obligatorio' })
  @IsInt()
  targetId: number;

  @IsNotEmpty({ message: 'El ID de la petición es obligatorio' })
  @IsInt()
  petitionId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}