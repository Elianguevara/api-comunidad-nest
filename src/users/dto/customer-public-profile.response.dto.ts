export class CustomerPublicProfileResponseDto {
  idCustomer: number;
  userId: number;
  name: string;
  lastname: string;
  profileImage: string | null;
  biography?: string;
  city?: string;
  rating: number;
  totalReviews: number;
  completedPetitions?: number;
}
