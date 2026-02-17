export class PetitionResponseDto {
  idPetition: number;
  description: string;
  typePetitionName: string;
  professionName: string;
  stateName: string;
  dateSince: Date | string;
  dateUntil: Date | string;
  customerName: string;
  cityName: string;
  imageUrl: string | null;
}