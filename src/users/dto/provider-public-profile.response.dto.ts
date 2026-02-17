export class ProviderPublicProfileResponseDto {
  idProvider: number;
  userId: number;
  name: string;
  lastname: string;
  profileImage: string;
  biography: string;
  professions: string[];
  cities: string[];
  rating: number;
  totalReviews: number;
}