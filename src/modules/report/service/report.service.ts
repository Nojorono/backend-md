import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/common/services/drizzle.service';
import {
  and,
  desc,
  eq,
  exists,
  isNull,
} from 'drizzle-orm';
import {
  Activity,
  mOutlets,
  ReimburseBbm,
  mUser,
  Absensi,
} from '../../../schema';
import { EXISTING_SURVEY_STATUS } from '../../../constants';
import * as xlsx from 'xlsx';

@Injectable()
export class ReportService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getReportActivity(
    batchCode: string,
  ): Promise<Buffer> {
    const db = this.drizzleService['db'];

    // Query data using Drizzle ORM
    const result = await db.query.Activity.findMany({
      where: and(isNull(Activity.deleted_at)),
      with: {
        callPlanSchedule: true,
        outlet: true,
        user: true,
        callPlan: {
          where: (CallPlan, { eq }) => eq(CallPlan.code_batch, batchCode),
        },
        activitySios: true,
        activitySogs: true,
        activityBranches: true,
        activityPrograms: true,
      },

      orderBy: (Activity, { asc, desc }) => [
        desc(Activity.created_at),
        asc(Activity.outlet_id),
      ],
    });

    // Format data into a worksheet with proper cell types and formats
    // Use the filtered data instead of the original result
    console.log(`Filtered absent data count: ${result.length}`);
    const data = result.map((row, index) => {
      // Format dates consistently
      const startTimeStr = row.start_time ? new Date(row.start_time).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) : '';
      const endTimeStr = row.end_time ? new Date(row.end_time).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) : '';

      const startTimeMs = row.start_time ? new Date(row.start_time).getTime() : 0;
      const endTimeMs = row.end_time ? new Date(row.end_time).getTime() : 0;
      const diffMs = startTimeMs && endTimeMs ? endTimeMs - startTimeMs : 0;
      const minutes = Math.floor(diffMs / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      const timeMotionStr = startTimeMs && endTimeMs ? `${minutes} Menit ${seconds} Detik` : '';

      // Handle photo URLs with hyperlinks and safe checks
      const photoColumns = {};
      if (Array.isArray(row?.photos)) {
        row.photos.forEach((photo, i) => {
          if (photo) {
            photoColumns[`Foto Check-In${i + 1}`] = {
              t: 's',
              v: photo,
              l: { Target: photo, Tooltip: `Click to view Foto${i + 1}` },
              s: { font: { color: { rgb: '0563C1' }, underline: true } }
            };
          }
        });
      }

      // Handle SIO data with proper validation
      const activitySioColumns = {};
      if (Array.isArray(row?.activitySios)) {
        row.activitySios.forEach((sio, i) => {  
          activitySioColumns[`Materi Branding SIO${i + 1}`] = {
            t: 's',
            v: sio.name || '',
          };
          if (sio.photo_before) {
            activitySioColumns[`Foto Sebelum ${i + 1}`] = {
              t: 's',
              v: sio.photo_before,
              l: { Target: sio.photo_before, Tooltip: `Click to view photo` },
              s: { font: { color: { rgb: '0563C1' }, underline: true } }
            };
          }
          if (sio.photo_after) {
            activitySioColumns[`Foto Sesudah ${i + 1}`] = {
              t: 's',
              v: sio.photo_after,
              l: { Target: sio.photo_after, Tooltip: `Click to view photo` },
              s: { font: { color: { rgb: '0563C1' }, underline: true } }
            };
          }
        });
      }

      // Handle SOG data with numeric validation
      const activitySogColumns = {};
      if (Array.isArray(row?.activitySogs)) {
        row.activitySogs.forEach((sog, i) => {
          activitySogColumns[`SOG Name ${i + 1}`] = {
            t: 's',
            v: sog.name || '',
          };
          activitySogColumns[`SOG Stock ${i + 1}`] = {
            t: 'n',
            v: Number(sog.value) || 0,
            z: '#,##0' // Apply number format
          };
        });
      }

      // Handle Branch data with numeric validation
      const activityBranchColumns = {};
      if (Array.isArray(row?.activityBranches)) {
        row.activityBranches.forEach((branch, i) => {
          activityBranchColumns[`Brand Family${i + 1}`] = {
            t: 's',
            v: branch.name || '',
          };
          activityBranchColumns[`Brand Family Stock${i + 1}`] = {
            t: 'n',
            v: Number(branch.value) || 0,
            z: '#,##0' // Apply number format
          };
        });
      }

      // Handle Program data with safe URL handling
      const activityProgramColumns = {};
      if (Array.isArray(row?.activityPrograms)) {
        row.activityPrograms.forEach((program, i) => {
          activityProgramColumns[`Program Kompetitor${i + 1}`] = {
            t: 's',
            v: program.name || '',
          };
          if (program.photo) {
            activityProgramColumns[`Foto${i + 1}`] = {
              t: 's',
              v: program.photo,
              l: { Target: program.photo, Tooltip: `Click to view photo` },
              s: { font: { color: { rgb: '0563C1' }, underline: true } }
            };
          }
        });
      }

      return {
        No: {
          t: 'n',
          v: index + 1,
          z: '0' // Format as simple number
        },
        Email: {
          t: 's',
          v: row.user?.email || ''
        },
        'Nama MD': {
          t: 's',
          v: row.user?.fullname || ''
        },
        Region: {
          t: 's',
          v: row.region || ''
        },
        Area: {
          t: 's',
          v: row.area || ''
        },
        Brand: {
          t: 's',
          v: row.brand || ''
        },
        'SIO Type': {
          t: 's',
          v: row.type_sio || ''
        },
        'Nama Outlet': {
          t: 's',
          v: row.outlet?.name || ''
        },
        'Kode Outlet': {
          t: 's',
          v: row.outlet?.outlet_code || ''
        },
        Alamat: {
          t: 's',
          v: row.outlet?.address_line || ''
        },
        Cycle: {
          t: 's',
          v: row.outlet?.cycle || ''
        },
        'Hari Kunjungan': {
          t: 's',
          v: row.outlet?.visit_day || ''
        },
        Keterangan: {
          t: 's',
          v: row.outlet?.remarks || ''
        },
        'Waktu Check-In': {
          t: 's',
          v: startTimeStr
        },
        'Waktu Check-Out': {
          t: 's',
          v: endTimeStr
        },
        'Waktu Perjalanan': {
          t: 's',
          v: timeMotionStr
        },
        Latitude: {
          t: 's',
          v: row.latitude || ''
        },
        Longitude: {
          t: 's',
          v: row.longitude || ''
        },
        Notes: {
          t: 's',
          v: row.notes || ''
        },
        'Foto Outlet': {
          t: 's',
          v: Array.isArray(row.photos) ? row.photos.join(', ') : ''
        },
        Status: {
          t: 's',
          v: row.status ? EXISTING_SURVEY_STATUS[row.status] : ''
        },
        'Status Approval': {
          t: 's',
          v: row.status_approval ? EXISTING_SURVEY_STATUS[row.status_approval] : ''
        },
        'Total Penjualan': {
          t: 'n',
          v: Number(row.sale_outlet_weekly) || 0,
          z: '#,##0' // Apply number format
        },
        ...photoColumns,
        ...activitySogColumns,
        ...activityBranchColumns,
        ...activityProgramColumns,
        ...activitySioColumns,
      };
    });

    // Handle potential empty data array to prevent 'Cannot convert undefined or null to object' error
    const workbook = xlsx.utils.book_new();
    let worksheet;
    
    if (data.length === 0) {
      // Create a worksheet with a message if no data matches the filter
      worksheet = xlsx.utils.json_to_sheet([{
        'No Data': 'No reimbursement data found matching the selected filters'
      }]);
    } else {
      // Create worksheet with the available data
      worksheet = xlsx.utils.json_to_sheet(data);
    }

    // Get the range of the worksheet
    const range = xlsx.utils.decode_range(worksheet['!ref']);

    // Create header style
    const headerStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { rgb: '4F81BD' }
      },
      font: {
        color: { rgb: 'FFFFFF' },
        bold: true
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply styles to headers and add borders to all cells
    for (let col = range.s.c; col <= range.e.c; col++) {
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellRef = xlsx.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { v: '' };
        }
        
        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };

        // Apply header style to first row
        if (row === 0) {
          worksheet[cellRef].s = headerStyle;
        }
      }
    }

    // Add filter to headers
    worksheet['!autofilter'] = { ref: `A1:${xlsx.utils.encode_cell({ r: 0, c: range.e.c })}` };

    // Set column widths
    const cols = [];
    for (let i = 0; i <= range.e.c; i++) {
      cols.push({ wch: 15 }); // Set width to 15 characters
    }
    worksheet['!cols'] = cols;

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Activity Report');

    // Generate Excel buffer
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      bookSST: false,
      cellStyles: true
    });

    return excelBuffer;
  }

  async getReportOutlet(filter: {
    area: string;
    region: string;
    brand: string;
    sio_type: string;
  }) {
    const db = this.drizzleService['db'];

    const baseConditions = [
      isNull(mOutlets.deleted_at),
      eq(mOutlets.is_active, 1),
    ];

    // Only add filter conditions if the values are non-empty strings
    if (filter.area && filter.area.trim() !== '') {
      baseConditions.push(eq(mOutlets.area, filter.area));
    }

    if (filter.region && filter.region.trim() !== '') {
      baseConditions.push(eq(mOutlets.region, filter.region));
    }

    if (filter.brand && filter.brand.trim() !== '') {
      baseConditions.push(eq(mOutlets.brand, filter.brand));
    }

    if (filter.sio_type && filter.sio_type.trim() !== '') {
      baseConditions.push(eq(mOutlets.sio_type, filter.sio_type));
    }

    const result = await db
      .select()
      .from(mOutlets)
      .where(and(...baseConditions));

    // Use the filtered data instead of the original result
    console.log(`Filtered absent data count: ${result.length}`);
    const data = result.map((row, index) => {
      const photoColumns = {};
      // Add safety check to ensure photos is an array
      if (row.photos && Array.isArray(row.photos)) {
        row.photos.forEach((photo, i) => {
          if (photo) {
            photoColumns[`Foto${i + 1}`] = {
              t: 's',
              v: photo,
              l: { Target: photo, Tooltip: `Click to view Foto${i + 1}` },
            };
          }
        });
      }

      return {
        No: index + 1,
        'Nama Outlet': row.name || '',
        'Code Outlet': row.outlet_code || '',
        Brand: row.brand || '',
        'SIO Type': row.sio_type || '',
        Region: row.region || '',
        Area: row.area || '',
        Alamat: row.address_line || '',
        Latitude: row.latitude || '',
        Longitude: row.longitude || '',
        Cycle: row.cycle || '',
        'Hari Kunjungan': row.visit_day || '',
        'Genap/Ganjil': row.odd_even || '',
        Keterangan: row.remarks || '',
        ...photoColumns,
      };
    });

    // Handle potential empty data array to prevent 'Cannot convert undefined or null to object' error
    const workbook = xlsx.utils.book_new();
    let worksheet;
    
    if (data.length === 0) {
      // Create a worksheet with a message if no data matches the filter
      worksheet = xlsx.utils.json_to_sheet([{
        'No Data': 'No reimbursement data found matching the selected filters'
      }]);
    } else {
      // Create worksheet with the available data
      worksheet = xlsx.utils.json_to_sheet(data);
    }

    // Get the range of the worksheet
    const range = xlsx.utils.decode_range(worksheet['!ref']);

    // Create header style
    const headerStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { rgb: '4F81BD' }
      },
      font: {
        color: { rgb: 'FFFFFF' },
        bold: true
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply styles to headers and add borders to all cells
    for (let col = range.s.c; col <= range.e.c; col++) {
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellRef = xlsx.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { v: '' };
        }
        
        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };

        // Apply header style to first row
        if (row === 0) {
          worksheet[cellRef].s = headerStyle;
        }
      }
    }

    // Add filter to headers
    worksheet['!autofilter'] = { ref: `A1:${xlsx.utils.encode_cell({ r: 0, c: range.e.c })}` };

    // Set column widths
    const cols = [];
    for (let i = 0; i <= range.e.c; i++) {
      cols.push({ wch: 15 }); // Set width to 15 characters
    }
    worksheet['!cols'] = cols;

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Outlet Report');

    // Generate Excel buffer
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      bookSST: false,
      cellStyles: true
    });

    return excelBuffer;
  }

  async getReportReimbursement(filter: {
    area: string;
    region: string;
  }) {

    const db = this.drizzleService['db'];

    const result = await db.query.ReimburseBbm.findMany({
      with: {
        user: true,
      },
    });

    // Process the data by filtering matching entries
    const data = result.filter(row => {
      // If filter values are empty strings or undefined, treat them as wildcards
      const areaMatch = !filter.area || filter.area.trim() === '' || row.user.area === filter.area;
      const regionMatch = !filter.region || filter.region.trim() === '' || row.user.region === filter.region;
      
      return areaMatch && regionMatch;
    }).map((row, index) => {

      const photos = {
        'Foto In': {
          t: 's', 
          v: row.photo_in,
          l: { Target: row.photo_in, Tooltip: 'Click to view Foto In' }
        },
        'Foto Out': {
          t: 's',
          v: row.photo_out || '',
          l: row.photo_out ? { Target: row.photo_out, Tooltip: 'Click to view Foto Out' } : undefined
        }
      };

      return {
        No: index + 1,
        Username: row.user.username,
        'Full Name': row.user.fullname,
        Region: row.user.region,
        Area: row.user.area,
        'Type MD': row.user.type_md,
        'Kilometer In': row.kilometer_in,
        'Kilometer Out': row.kilometer_out,
        'Total Kilometer': row.total_kilometer,
        'Date In': row.date_in ? new Date(row.date_in).toLocaleString() : '',
        'Date Out': row.date_out ? new Date(row.date_out).toLocaleString() : '',
        Description: row.description,
        Status: row.status === 0 ? 'Pending' : row.status === 1 ? 'Approved' : 'Rejected',
        'Approved By': row.approved_by,
        'Approved At': row.approved_at ? new Date(row.approved_at).toLocaleString() : '',
        ...photos
      };
    });

    // Handle potential empty data array to prevent 'Cannot convert undefined or null to object' error
    const workbook = xlsx.utils.book_new();
    let worksheet;
    
    if (data.length === 0) {
      // Create a worksheet with a message if no data matches the filter
      worksheet = xlsx.utils.json_to_sheet([{
        'No Data': 'No reimbursement data found matching the selected filters'
      }]);
    } else {
      // Create worksheet with the available data
      worksheet = xlsx.utils.json_to_sheet(data);
    }

    // Get the range of the worksheet
    const range = xlsx.utils.decode_range(worksheet['!ref']);

    // Create header style
    const headerStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { rgb: '4F81BD' }
      },
      font: {
        color: { rgb: 'FFFFFF' },
        bold: true
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply styles to headers and add borders to all cells
    for (let col = range.s.c; col <= range.e.c; col++) {
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellRef = xlsx.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { v: '' };
        }
        
        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };

        // Apply header style to first row
        if (row === 0) {
          worksheet[cellRef].s = headerStyle;
        }
      }
    }

    // Add filter to headers
    worksheet['!autofilter'] = { ref: `A1:${xlsx.utils.encode_cell({ r: 0, c: range.e.c })}` };

    // Set column widths
    const cols = [];
    for (let i = 0; i <= range.e.c; i++) {
      cols.push({ wch: 15 }); // Set width to 15 characters
    }
    worksheet['!cols'] = cols;

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Outlet Report');

    // Generate Excel buffer
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      bookSST: false,
      cellStyles: true
    });

    return excelBuffer;

  }

  async getReportAbsent(filter: {
    area: string;
    region: string;
  }) {

    const db = this.drizzleService['db'];

    // Query all absences with user data
    console.log('Starting absent report generation with filters:', filter);
    const result = await db.query.Absensi.findMany({
        with: {
            user: true,
        }
    });
    
    // Filter the results based on area and region
    // Use empty string checks to make empty filters act as wildcards
    const filteredResult = result.filter(row => {
        const areaMatch = !filter.area || filter.area.trim() === '' || row.area === filter.area;
        const regionMatch = !filter.region || filter.region.trim() === '' || row.region === filter.region;
        return areaMatch && regionMatch;
    });

    // Use the filtered data instead of the original result
    console.log(`Filtered absent data count: ${filteredResult.length}`);
    const data = filteredResult.map((row, index) => {
      const photos = {
        'Foto In': {
          t: 's',
          v: row.photoIn || '',
          l: row.photoIn ? { Target: row.photoIn, Tooltip: 'Click to view Foto In' } : undefined
        },
        'Foto Out': {
          t: 's', 
          v: row.photoOut || '',
          l: row.photoOut ? { Target: row.photoOut, Tooltip: 'Click to view Foto Out' } : undefined
        }
      };

      return {
        No: index + 1,
        Username: row.user.username,
        'Full Name': row.user.fullname,
        Region: row.region,
        Area: row.area,
        'Type MD': row.user.type_md,
        Date: new Date(row.date).toLocaleDateString(),
        'Clock In': row.clockIn ? new Date(row.clockIn).toLocaleString() : '',
        'Clock Out': row.clockOut ? new Date(row.clockOut).toLocaleString() : '',
        Status: row.status,
        Remarks: row.remarks || '',
        'Longitude In': row.longitudeIn || '',
        'Latitude In': row.latitudeIn || '',
        'Longitude Out': row.longitudeOut || '',
        'Latitude Out': row.latitudeOut || '',
        ...photos
      };
    });

    // Handle potential empty data array to prevent 'Cannot convert undefined or null to object' error
    const workbook = xlsx.utils.book_new();
    let worksheet;
    
    if (data.length === 0) {
      // Create a worksheet with a message if no data matches the filter
      worksheet = xlsx.utils.json_to_sheet([{
        'No Data': 'No reimbursement data found matching the selected filters'
      }]);
    } else {
      // Create worksheet with the available data
      worksheet = xlsx.utils.json_to_sheet(data);
    }

    // Get the range of the worksheet
    const range = xlsx.utils.decode_range(worksheet['!ref']);

    // Create header style
    const headerStyle = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { rgb: '4F81BD' }
      },
      font: {
        color: { rgb: 'FFFFFF' },
        bold: true
      },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Apply styles to headers and add borders to all cells
    for (let col = range.s.c; col <= range.e.c; col++) {
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellRef = xlsx.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { v: '' };
        }
        
        worksheet[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };

        // Apply header style to first row
        if (row === 0) {
          worksheet[cellRef].s = headerStyle;
        }
      }
    }

    // Add filter to headers
    worksheet['!autofilter'] = { ref: `A1:${xlsx.utils.encode_cell({ r: 0, c: range.e.c })}` };

    // Set column widths
    const cols = [];
    for (let i = 0; i <= range.e.c; i++) {
      cols.push({ wch: 15 }); // Set width to 15 characters
    }
    worksheet['!cols'] = cols;

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Outlet Report');

    // Generate Excel buffer
    const excelBuffer = xlsx.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      bookSST: false,
      cellStyles: true
    });

    return excelBuffer;

  }
}
