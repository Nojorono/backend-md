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

  async updateOutlet(id: string, updateOutletDto: UpdateOutletDto) {
    const idDecrypt = await this.outletRepository.decryptId(id);
    return this.outletRepository.updateOutlet(idDecrypt, updateOutletDto);
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

    // Expected headers according to system requirements
    const expectedHeaders = [
      'id',
      'user_id',
      'nama_user',
      'nama_outlet',
      'kode_outlet',
      'brand',
      'regional',
      'area',
      'kabupaten',
      'kecamatan',
      'alamat',
      'tipe_outlet',
      'status',
      'long',
      'lat',
      'outlet_radius',
      'cycle',
      'hari_kunjungan',
      'week',
      'foto1',
      'foto2',
      'foto3',
      'foto4',
      'BRAND_CODE',
      'Tipe_Outlet_Upload'
    ];

    // Get the JSON data, convert to array format
    const jsonData: (string | number | undefined)[][] = 
      xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Skip processing if the file is empty
    if (jsonData.length === 0) {
      throw new Error('File is empty or has invalid format');
    }

    // Determine if the first row is a header row by checking if it matches expected headers
    const firstRow = jsonData[0];
    let startRowIndex = 0;
    
    // If first row appears to be headers, skip it when processing data
    if (typeof firstRow[0] === 'string' && !isNaN(Number(firstRow[0]))) {
      // If first column is a numeric string, likely not a header
      startRowIndex = 0;
    } else {
      // Check if any cell in first row matches expected column names
      const possibleHeaderRow = firstRow.map(cell => 
        typeof cell === 'string' ? cell.toLowerCase().trim() : ''
      );
      
      // Check if this looks like a header row by comparing with expected headers
      const containsHeaderTerms = expectedHeaders.some(header => 
        possibleHeaderRow.some(cell => 
          cell.includes(header.toLowerCase())
        )
      );
      
      startRowIndex = containsHeaderTerms ? 1 : 0;
    }

    // Create a header mapping from the first row if it exists
    let headerMapping: { [key: string]: number } = {};
    
    if (startRowIndex > 0 && jsonData[0]) {
      // If we detected a header row, use it to create a mapping
      jsonData[0].forEach((header, index) => {
        if (typeof header === 'string') {
          const headerLower = header.toLowerCase().trim();
          headerMapping[headerLower] = index;
        }
      });
    } else {
      // If no header row, map expected headers to their positions
      expectedHeaders.forEach((header, index) => {
        headerMapping[header.toLowerCase()] = index;
      });
    }
    
    console.log('Header mapping:', headerMapping);
    
    // Process data rows using the header mapping
    for (let i = startRowIndex; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip empty rows or rows with insufficient data
      if (row.length < 5) continue;

      try {
        const photoArray = [];
        
        // Get field indices from header mapping or use defaults
        const getField = (field: string, defaultValue: string = '') => {
          const index = headerMapping[field.toLowerCase()];
          return index !== undefined && row[index] !== undefined ? String(row[index]) : defaultValue;
        };
        
        // Add photos if they exist
        const foto1 = getField('foto1');
        const foto2 = getField('foto2');
        const foto3 = getField('foto3');
        const foto4 = getField('foto4');
        
        if (foto1) photoArray.push(foto1);
        if (foto2) photoArray.push(foto2);
        if (foto3) photoArray.push(foto3);
        if (foto4) photoArray.push(foto4);

        // Map data from Excel to database schema using header mapping
        const outlet = {
          outlet_code: getField('kode_outlet'),
          name: getField('nama_outlet'),
          brand: getField('brand'),
          region: getField('regional'),
          area: getField('area'),
          district: getField('kecamatan'),
          sub_district: getField('kabupaten'),
          address_line: getField('alamat'),
          sio_type: getField('Tipe_Outlet_Upload'),
          longitude: getField('long'),
          latitude: getField('lat'),
          cycle: getField('cycle'),
          visit_day: getField('hari_kunjungan'),
          odd_even: getField('week'),
          photos: photoArray.length > 0 ? photoArray : [],
          created_by: 'system',
          created_at: new Date(),
          updated_by: 'system',
          updated_at: new Date()
        };

        // Validate required fields before adding to data array
        if (outlet.name && outlet.outlet_code && outlet.brand) {
          data.push(outlet);
        } else {
          console.warn(`Skipping row ${i+1}: Missing required fields`);
        }
      } catch (error) {
        console.error(`Error processing row ${i+1}:`, error);
        // Continue processing other rows
      }
    }

    if (data.length === 0) {
      throw new Error('No valid data found in the uploaded file');
    }

    // Save data to the database using the Drizzle service
    // Use batch inserts if there are many records to optimize performance
    if (data.length <= 100) {
      await this.drizzleService['db'].insert(mOutlets).values(data);
    } else {
      // Process in batches of 100 records to prevent issues with large datasets
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await this.drizzleService['db'].insert(mOutlets).values(batch);
      }
    }

    return { success: true, recordsInserted: data.length };
  }

  async uploadCSV(file: Express.Multer.File) {
    const results: any[] = [];
    const invalidRows: any[] = [];
    const expectedHeaders = [
      'id',
      'user_id',
      'nama_user',
      'nama_outlet',
      'kode_outlet',
      'brand',
      'regional',
      'area',
      'kabupaten',
      'kecamatan',
      'alamat',
      'tipe_outlet',
      'status',
      'long',
      'lat',
      'outlet_radius',
      'cycle',
      'hari_kunjungan',
      'week',
      'foto1',
      'foto2',
      'foto3',
      'foto4',
      'BRAND_CODE',
      'Tipe_Outlet_Upload'
    ];

    // Create a readable stream from the file buffer
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null); // Signal the end of the stream   

    return new Promise((resolve, reject) => {
      stream
        .pipe(csvParser({ headers: expectedHeaders, skipLines: 1 }))
        .on('data', (data) => {
          // Process each row
          if (data) {
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
              sio_type: data['Tipe_Outlet_Upload']
                ? data['Tipe_Outlet_Upload'].toUpperCase()
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
