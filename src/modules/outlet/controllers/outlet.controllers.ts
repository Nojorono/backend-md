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
  async getOutletByType(@Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.outletService.getOutletByUser(accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createOutletDto: CreateOutletDto) {
    return this.outletService.createOutlet(createOutletDto);
  }

  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.outletService.getOutletById(id);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
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
  ) {
    return this.outletService.getAllActiveOutlets(
      page,
      limit,
      searchTerm,
      isActive,
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
