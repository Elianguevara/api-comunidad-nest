export class ReviewResponseDto {
  idReview: number;
  reviewerName: string;
  rating: number;
  comment: string;
  date: Date; // Lo enviaremos como ISO string desde el controlador/servicio
}