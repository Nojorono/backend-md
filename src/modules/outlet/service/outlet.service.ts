import { Injectable } from '@nestjs/common';
import { OutletRepository } from '../repository/outlet.repository';
import { CreateOutletDto, UpdateOutletDto } from '../dtos/outlet.dtos';
import * as xlsx from 'xlsx';
import * as multer from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { mOutlets } from '../../../schema';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { chunkArray } from '../../../helpers/nojorono.helpers';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class OutletService {
  constructor(
    private readonly outletRepository: OutletRepository,
    private readonly userRepository: UserRepo,
    private readonly drizzleService: DrizzleService,
  ) {}

  async getOutletByFilter(query: { region: string, area: string, brand: string, sio_type: string }) {
    return this.outletRepository.getOutletByFilter(query);
  }

  private readonly upload: MulterOptions = {
    storage: multer.memoryStorage(),
  };

  async getOutletByUser(region: string, area: string) {
    return this.outletRepository.getOutletByType(region, area);
  }
  async getOutletSio() {
    return this.outletRepository.getOutletTypeSio();
  }
  async getOutletRegion() {
    return this.outletRepository.getOutletRegion();
  }
  async getOutletArea() {
    return this.outletRepository.getOutletArea();
  }

  async createOutlet(createOutletDto: CreateOutletDto) {
    return this.outletRepository.createOutlet(createOutletDto);
  }

  async getOutletById(id: string) {
    return this.outletRepository.getOutletById(id);
  }

  async updateOutlet(id: number, updateOutletDto: UpdateOutletDto) {
    return this.outletRepository.updateOutlet(id, updateOutletDto);
  }

  async updateOutletStatus(id: number, updateOutletDto: UpdateOutletDto) {
    return this.outletRepository.updateOutletStatus(id, updateOutletDto);
  }

  async deleteOutlet(id: number) {
    return this.outletRepository.deleteOutlet(id);
  }

  async getAllActiveOutlets(
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    isActive: number = 1,
    filter: { area: string; region: string; brand: string; sio_type: string },
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.outletRepository.getAllActiveOutlets(
      pageInt,
      limitInt,
      searchTerm,
      isActive,
      filter,
    );
  }

  async uploadExcel(file: Express.Multer.File) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const data: any[] = [];

    // Assuming the first sheet contains the data
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Type the jsonData as an array of arrays
    const jsonData: (string | number | undefined)[][] =
      xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Process the data according to your field order
    for (const row of jsonData) {
      if (row.length > 0) {
        const outlet = {
          name: row[0], // Column 0: name
          outlet_code: row[1], // Column 1: outlet_code
          brand: row[2], // Column 2: brand
          region: row[3], // Column 3: region
          area: row[4], // Column 4: area
          district: row[5], // Column 5: district
          address_line: row[6], // Column 6: address_line
          outlet_type: row[7] || '', // Column 7: outlet_type
          longitude: row[8] || '', // Column 8: longitude
          latitude: row[9] || '', // Column 9: latitude
          cycle: row[10] || '', // Column 10: cycle
          visit_day: row[11], // Column 11: visit_day
          odd_even: row[12], // Column 12: odd_even
          unique_name: row[13], // Column 13: unique_name
          photos: row[14] || [], // Column 14: photos
          remarks: row[15] || '', // Column 15: remarks
          created_by: 'system', // Or derive from your context
          created_at: new Date(),
          updated_by: 'system',
          updated_at: new Date(),
        };
        data.push(outlet);
      }
    }

    // Save data to the database using the Drizzle service
    await this.drizzleService['db'].insert(mOutlets).values(data);
  }

  async uploadCSV(file: Express.Multer.File) {
    const results: any[] = [];
    const invalidRows: any[] = [];
    const expectedHeaders = [
      'id',
      'user_id',
      'nama_outlet',
      'kode_outlet',
      'brand',
      'regional',
      'area',
      'kecamatan',
      'alamat',
      'tipe_outlet',
      'long',
      'lat',
      'cycle',
      'hari_kunjungan',
      'week',
      'foto1',
      'foto2',
      'foto3',
      'foto4',
    ];
    let isHeaderRow = true;
    let headersValidated = false;

    // Create a readable stream from the file buffer
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null); // Signal the end of the stream

    // Function to validate header row
    function validateHeaders(row: any): boolean {
      const headers = Object.keys(row);
      return headers.every(
        (header, index) => header === expectedHeaders[index],
      );
    }

    // Validation function for row data based on mOutlets schema
    function isValidRow(data: any) {
      return (
        data['nama_outlet'] &&
        data['kode_outlet'] &&
        data['brand'] &&
        data['regional'] &&
        data['area'] &&
        data['kecamatan']
      );
    }

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser({ headers: expectedHeaders, skipLines: 1 }))
        .on('data', (data) => {
          if (isHeaderRow) {
            // Validate the headers of the first row
            headersValidated = validateHeaders(data);
            if (!headersValidated) {
              reject(new Error('Invalid headers in CSV file.'));
              return;
            }
            isHeaderRow = false;
          } else {
            // Validate and format each row if headers are correct
            if (isValidRow(data)) {
              const outlet = {
                name: data['nama_outlet'],
                outlet_code: data['kode_outlet'],
                brand: data['brand'] ? data['brand'].toUpperCase() : '',
                region: data['regional'] ? data['regional'].toUpperCase() : '',
                area: data['area'] ? data['area'].toUpperCase() : '',
                sub_district: data['kecamatan']
                  ? data['kecamatan'].toUpperCase()
                  : '',
                address_line: data['alamat'] || '',
                sio_type: data['tipe_outlet']
                  ? data['tipe_outlet'].toUpperCase()
                  : '',
                longitude: data['long'] || '',
                latitude: data['lat'] || '',
                cycle: data['cycle'] || '',
                visit_day: data['hari_kunjungan']
                  ? data['hari_kunjungan'].toUpperCase()
                  : '',
                odd_even: data['week'] ? data['week'].toUpperCase() : '',
                photos: [
                  data['foto1'],
                  data['foto2'],
                  data['foto3'],
                  data['foto4'],
                ].filter(Boolean),
                created_at: new Date(),
                created_by: 'system upload csv',
              };
              results.push(outlet);
            } else {
              invalidRows.push(data);
            }
          }
        })
        .on('end', async () => {
          try {
            const chunkSize = 200;
            const chunks = chunkArray(results, chunkSize);
            await Promise.all(
              chunks.map((chunk) =>
                this.drizzleService['db'].insert(mOutlets).values(chunk),
              ),
            );

            if (invalidRows.length > 0) {
              console.log(
                `${invalidRows.length} rows were invalid and discarded.`,
              );
            }

            resolve(results);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => reject(error));
    });
  }
}
