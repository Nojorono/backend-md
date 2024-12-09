import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { SurveyService } from '../service/survey.service';
import { CreateDto, UpdateDto } from '../dtos/survey.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('survey')
@Controller({
  version: '1',
  path: '/survey',
})
export class SurveyControllers {
  constructor(private readonly SurveyService: SurveyService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() CreateDto: CreateDto, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.SurveyService.create(CreateDto, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get('schedule/:callPlanId')  
  async findSchedule(
    @Param('callPlanId') callPlanId: string,
    ) {
    return this.SurveyService.getSchedule(callPlanId);
  }
  
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.SurveyService.getById(id);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() UpdateDto: UpdateDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.SurveyService.update(id, UpdateDto, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.SurveyService.delete(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Query('isActive') isActive: string = '',
    @Query('filter') filter: { area: string; region: string } = { area: '', region: '' },
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.SurveyService.getAll(accessToken, page, limit, searchTerm, isActive, filter);
  }
}
