import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  DefaultValuePipe, 
  ParseIntPipe 
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { RateRequestDto } from './dto/rate.request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('grades')
@UseGuards(AuthGuard('jwt'))
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post('rate-provider')
  rateProvider(@Request() req, @Body() request: RateRequestDto) {
    // Al igual que en Java devolvemos un string, pero en JSON para React
    this.gradesService.rateProvider(req.user.email, request);
    return { message: "Calificación enviada con éxito." };
  }

  @Post('rate-customer')
  rateCustomer(@Request() req, @Body() request: RateRequestDto) {
    this.gradesService.rateCustomer(req.user.email, request);
    return { message: "Calificación enviada con éxito." };
  }

  @Get('provider/:providerId')
  getProviderReviews(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(5), ParseIntPipe) size: number,
  ) {
    return this.gradesService.getProviderReviews(providerId, page, size);
  }

  @Get('check-rated/:providerId')
  checkIfRated(
    @Request() req,
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('petitionId', ParseIntPipe) petitionId: number,
  ) {
    return this.gradesService.hasCustomerRatedProvider(req.user.email, providerId, petitionId);
  }

  @Get('customer-rating-status/:petitionId')
  getCustomerRatingStatus(
    @Request() req,
    @Param('petitionId', ParseIntPipe) petitionId: number,
  ) {
    return this.gradesService.getCustomerRatingStatus(req.user.email, petitionId);
  }
}