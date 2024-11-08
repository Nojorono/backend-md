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

  private readonly upload: MulterOptions = {
    storage: multer.memoryStorage(),
  };

  async getOutletByUser(user) {
    const isUser = await this.userRepository.findByToken(user);
    return this.outletRepository.getOutletByType(isUser.region, isUser.area);
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

  async getOutletById(id: number) {
    return this.outletRepository.getOutletById(id);
  }

  async updateOutlet(id: number, updateOutletDto: UpdateOutletDto) {
    return this.outletRepository.updateOutlet(id, updateOutletDto);
  }

  async deleteOutlet(id: number) {
    return this.outletRepository.deleteOutlet(id);
  }

  async getAllActiveOutlets(
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.outletRepository.getAllActiveOutlets(
      pageInt,
      limitInt,
      searchTerm,
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
    const invalidRows: any[] = []; // Optional: Store invalid rows

    // Create a readable stream from the file buffer
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null); // Signal the end of the stream

    // Validation function based on mOutlets schema
    function isValidRow(data: any) {
      // Check required fields (non-nullable in the schema)
      // if (
      //   !data['_0'] ||
      //   !data['_1'] ||
      //   !data['_2'] ||
      //   !data['_3'] ||
      //   !data['_5'] ||
      //   !data['_11'] ||
      //   !data['_12'] ||
      //   !data['_13']
      // ) {
      //   return false; // Return false if any required field is missing
      // }

      // Ensure postal code is a valid integer
      // if (data['_5'] && isNaN(parseInt(data['_5']))) {
      //   return false; // Invalid postal code
      // }
      // Add any additional validation rules as needed
      console.log(data);
      return true; // Return true if the row passes all validation checks
    }

    return new Promise((resolve, reject) => {
      // Use csv-parser to parse the stream
      stream
        .pipe(csvParser({ headers: true }))
        .on('data', (data) => {
          // Validate the row
          if (isValidRow(data)) {
            // If valid, format the data and push to results
            const outlet = {
              outlet_code: data['_1'], // Required
              name: data['_0'], // Required
              brand: data['_2'], // Required
              unique_name: data['_13'], // Required
              address_line: data['_6'], // Required
              district: data['_5'], // Required
              sub_district: data['_5'] || '', // Optional
              city_or_regency: data['_6'] || '', // Optional
              postal_code: 1, // Default 1 if invalid
              latitude: data['_9'] || '', // Optional
              longitude: data['_8'] || '', // Optional
              outlet_type: data['_7'] || '', // Optional
              region: data['_3'] || '', // Optional
              area: data['_4'] || '', // Optional
              cycle: data['_10'] || '', // Optional
              is_active: 1, // Default 1
              visit_day: data['_11'], // Required
              odd_even: data['_12'], // Required
              photos: data['_14']
                ? data['_14'].split(',').map((photo: string) => photo.trim())
                : [], // Optional, parsed as array
              remarks: data['_15'] || '', // Optional
              created_at: new Date(),
              updated_at: new Date(),
              created_by: 'system',
              updated_by: 'system',
            };
            results.push(outlet);
          } else {
            // If invalid, push to invalidRows (optional)
            invalidRows.push(data);
          }
        })
        .on('end', async () => {
          try {
            // Split results into chunks for parallel insertion
            const chunkSize = 200; // Adjust the chunk size based on performance needs
            const chunks = chunkArray(results, chunkSize);

            // Insert chunks in parallel using Promise.all
            await Promise.all(
              chunks.map((chunk) =>
                this.drizzleService['db'].insert(mOutlets).values(chunk),
              ),
            );

            // Optionally log or handle invalid rows
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
