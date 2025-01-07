import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/common/services/drizzle.service';
import {
  and,
  desc,
  eq,
  isNull,
} from 'drizzle-orm';
import {
  Activity,
  mOutlets,
} from '../../../schema';
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
        surveyOutlet: true,
        outlet: true,
        user: true,
        callPlan: {
          where: (CallPlan, { eq }) => eq(CallPlan.code_batch, batchCode),
        },
        activitySios: true,
        activitySogs: true,
        activityBranches: true,
      },

      orderBy: (Activity, { asc, desc }) => [
        desc(Activity.created_at),
        asc(Activity.outlet_id),
      ],
    });

    // Format data into a worksheet
    const data = result.map((row, index) => {

      const photoColumns = {};
      row.photos.forEach((photo, i) => {
        photoColumns[`Foto Activity${i + 1}`] = {
          t: 's',
          v: photo,
          l: { Target: photo, Tooltip: `Click to view Foto${i + 1}` },
        };
      });

      const activitySioColumns = {};
      row.activitySios.forEach((sio, i) => {  
        activitySioColumns[`SIO Name${i + 1}`] = {
          t: 's',
          v: sio.name,
        };
        activitySioColumns[`SIO Photo${i + 1}`] = {
          t: 's',
          v: sio.photo,
        };
      });

      const activitySogColumns = {};
      row.activitySogs.forEach((sog, i) => {
        activitySogColumns[`SOG Name${i + 1}`] = {
          t: 's',
          v: sog.name,
        };
        activitySogColumns[`Stock`] = {
          t: 's',
          v: sog.value,
        };
      });

      const activityBranchColumns = {};
      row.activityBranches.forEach((branch, i) => {
        activityBranchColumns[`Branch Name${i + 1}`] = {
          t: 's',
          v: branch.name,
        };
        activityBranchColumns[`Branch Value${i + 1}`] = {
          t: 's',
          v: branch.value,
        };
      });

      return {
        No: index + 1,
        Email: row.user.email,
        'Nama MD': row.user.fullname,
        Region: row.region,
        Area: row.area,
        Brand: row.brand,
        'SIO Type': row.type_sio,
        'Nama Outlet': row.outlet.name,
        'Code Outlet': row.outlet.outlet_code,
        Alamat: row.outlet.address_line,
        Cycle: row.outlet.cycle,
        'Hari Kunjungan': row.outlet.visit_day,
        Keterangan: row.outlet.remarks,
        'Start Time': row.start_time,
        'End Time': row.end_time,
        Latitude: row.latitude,
        Longitude: row.longitude,
        Notes: row.notes,
        Photos: row.photos,
        Status: row.status,
        'Status Approval': row.status_approval,
        ...photoColumns,
        ...activitySioColumns,
        ...activitySogColumns,
        ...activityBranchColumns,
      };
    });

    // Create worksheet and workbook
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();

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

    if (filter.area) {
      baseConditions.push(eq(mOutlets.area, filter.area));
    }

    if (filter.region) {
      baseConditions.push(eq(mOutlets.region, filter.region));
    }

    if (filter.brand) {
      baseConditions.push(eq(mOutlets.brand, filter.brand));
    }

    if (filter.sio_type) {
      baseConditions.push(eq(mOutlets.sio_type, filter.sio_type));
    }

    const result = await db
      .select()
      .from(mOutlets)
      .where(and(...baseConditions));

    const data = result.map((row, index) => {
      const photoColumns = {};
      row.photos.forEach((photo, i) => {
        photoColumns[`Foto${i + 1}`] = {
          t: 's',
          v: photo,
          l: { Target: photo, Tooltip: `Click to view Foto${i + 1}` },
        };
      });

      return {
        No: index + 1,
        'Nama Outlet': row.name,
        'Code Outlet': row.outlet_code,
        Brand: row.brand,
        'SIO Type': row.sio_type,
        Region: row.region,
        Area: row.area,
        Alamat: row.address_line,
        Kecamatan: row.sub_district,
        Kelurahan: row.district,
        Kota: row.city_or_regency,
        Latitude: row.latitude,
        Longitude: row.longitude,
        Cycle: row.cycle,
        'Hari Kunjungan': row.visit_day,
        'Genap/Ganjil': row.odd_even,
        Keterangan: row.remarks,
        ...photoColumns,
      };
    });

    // Create worksheet and workbook
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();

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
