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
  async rateProvider(@Request() req, @Body() request: RateRequestDto) {
    await this.gradesService.rateProvider(req.user.email, request);
    return { message: "Calificación enviada con éxito." };
  }

  @Post('rate-customer')
  async rateCustomer(@Request() req, @Body() request: RateRequestDto) {
    await this.gradesService.rateCustomer(req.user.email, request);
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

  @Get('customer/:idCustomer')
  getCustomerReviews(
    @Param('idCustomer', ParseIntPipe) idCustomer: number,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('size', new DefaultValuePipe(5), ParseIntPipe) size: number,
    @Query('sort', new DefaultValuePipe('idGradeCustomer,desc')) sort: string,
  ) {
    return this.gradesService.getCustomerReviews(idCustomer, page, size, sort);
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
