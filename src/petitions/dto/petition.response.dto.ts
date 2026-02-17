export class PetitionResponseDto {
  idPetition: number;
  customerId: number;
  description: string;
  typePetitionName: string;
  professionName: string;
  stateName: string;
  dateSince: Date | string;
  dateUntil: Date | string;
  customerName: string;
  customerImage: string | null;
  cityName: string;
  imageUrl: string | null;
}
