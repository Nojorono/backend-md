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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OutletService } from '../service/outlet.service';
import { CreateOutletDto, UpdateOutletDto } from '../dtos/outlet.dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OutletRepository } from '../repository/outlet.repository';
import { Request } from 'express';

@ApiTags('outlets')
@Controller({
  version: '1',
  path: '/outlets',
})
export class OutletController {
  constructor(
    private readonly outletService: OutletService,
    private readonly outletRepository: OutletRepository,
  ) {}
  
  @ApiBearerAuth('accessToken')
  @Get('survey-list')
  async getAll(
    @Query('region') region: string,
    @Query('area') area: string
  ) {
    console.log(region?.trim(), area?.trim());
    return this.outletRepository.getAll(region?.trim(), area?.trim());
  }
  @ApiBearerAuth('accessToken')
  @Get('sio')
  async getSio() {
    return this.outletService.getOutletSio();
  }

  @ApiBearerAuth('accessToken')
  @Get('region')
  async getRegion() {
    return this.outletService.getOutletRegion();
  }

  @ApiBearerAuth('accessToken')
  @Get('area')
  async getArea() {
    return this.outletService.getOutletArea();
  }

  @ApiBearerAuth('accessToken')
  @Get('list-by')
  async getOutletByType(@Query() query: { region: string, area: string } ) {
    return this.outletService.getOutletByUser(query.region, query.area);
  }

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createOutletDto: CreateOutletDto) {
    return this.outletService.createOutlet(createOutletDto);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body() updateOutletDto: UpdateOutletDto) {
    return this.outletService.updateOutletStatus(id, updateOutletDto);
  }

  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.outletService.getOutletById(id);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOutletDto: UpdateOutletDto,
  ) {
    return this.outletService.updateOutlet(id, updateOutletDto);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.outletService.deleteOutlet(id);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Query('isActive') isActive: number = 1,
    @Query('filter') filter: { area: string; region: string; brand: string; sio_type: string } = { area: '', region: '', brand: '', sio_type: '' },
  ) {
    return this.outletService.getAllActiveOutlets(
      page,
      limit,
      searchTerm,
      isActive,
      filter,
    );
  }

  @ApiBearerAuth('accessToken')
  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    await this.outletService.uploadExcel(file);
    return { message: 'Excel file uploaded successfully' };
  }

  @ApiBearerAuth('accessToken')
  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    await this.outletService.uploadCSV(file);
    return { message: 'CSV file uploaded successfully' };
  }
}
