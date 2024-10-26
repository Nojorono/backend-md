import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { OutletService } from '../service/outlet.service';
import { CreateOutletDto, UpdateOutletDto } from '../dtos/outlet.dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('outlets')
@Controller({
  version: '1',
  path: '/outlets',
})
export class OutletController {
  constructor(private readonly outletService: OutletService) {}
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
  @Post()
  async create(@Body() createOutletDto: CreateOutletDto) {
    return this.outletService.createOutlet(createOutletDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.outletService.getAllActiveOutlets(page, limit, searchTerm);
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
