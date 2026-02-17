export class PostulationResponseDto {
  idPostulation: number;
  description: string;
  budget: number;
  
  providerId: number;
  providerName: string;
  providerImage: string;
  providerRating: number;
  
  petitionTitle: string;
  petitionId: number;
  
  stateName: string;
  isWinner: boolean;
  datePostulation: string;
  proposal: string;

  // Puedes opcionalmente agregar un constructor para inicializarlo fácilmente 
  // en el Service, imitando el patrón Builder de Java:
  constructor(partial: Partial<PostulationResponseDto>) {
    Object.assign(this, partial);
  }
}