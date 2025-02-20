import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/common/services/drizzle.service';
import {
  and,
  count,
  desc,
  count as drizzleCount,
  eq,
  gte,
  isNotNull,
  isNull,
  or,
  sql,
} from 'drizzle-orm';
import {
  Mbatch,
  MbatchTarget,
  Activity,
  CallPlan,
  mOutlets,
  MBrand,
  CallPlanSchedule,
  mUser,
} from '../../../schema';
import { decrypt } from 'src/helpers/nojorono.helpers';

@Injectable()
export class DashboardService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getTimeMotion() {
    const db = this.drizzleService['db'];
    const queryTimeMotion = await db
      .select({
        time_start: CallPlanSchedule.time_start,
        time_end: CallPlanSchedule.time_end,
        region: mUser.region,
        area: mUser.area,
        user_id: mUser.id,
      })
      .from(CallPlanSchedule)
      .leftJoin(mUser, eq(CallPlanSchedule.user_id, mUser.id))
      .where(isNull(CallPlanSchedule.deleted_at));

    // Group data by region and area
    const regionAreaStats: {
      [key: string]: {
        region: string;
        area: string;
        totalTime: number;
        validRecords: number;
        uniqueUsers: Set<number>;
      };
    } = {};
    let totalTime = 0;
    let validRecords = 0;

    queryTimeMotion.forEach((item) => {
      const key = `${item.region}-${item.area}`;

      if (!regionAreaStats[key]) {
        regionAreaStats[key] = {
          region: item.region,
          area: item.area,
          totalTime: 0,
          validRecords: 0,
          uniqueUsers: new Set(),
        };
      }

      if (item.time_start && item.time_end) {
        const diffInMinutes =
          (item.time_end.getTime() - item.time_start.getTime()) / (1000 * 60);
        regionAreaStats[key].totalTime += diffInMinutes;
        regionAreaStats[key].validRecords++;
        regionAreaStats[key].uniqueUsers.add(item.user_id);

        totalTime += diffInMinutes;
        validRecords++;
      }
    });

    // Calculate averages and format results
    const stats = Object.values(regionAreaStats).map((stat) => ({
      region: stat.region,
      area: stat.area,
      total_user_md: stat.uniqueUsers.size,
      average_time:
        stat.validRecords > 0 ? stat.totalTime / stat.validRecords : 0,
    }));

    return stats;
  }

  async getOutletDistribution() {
    const db = this.drizzleService['db'];

    let totalOutlet = 0;
    let totalOutletActive = 0;
    let totalOutletInactive = 0;

    const queryOutletDistribution = await db
      .select({
        outlet_id: mOutlets.id,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at));

    totalOutlet = queryOutletDistribution.length;

    const queryOutletDistributionActive = await db
      .select({
        outlet_id: mOutlets.id,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at) && eq(mOutlets.is_active, 1));

    totalOutletActive = queryOutletDistributionActive.length;

    const queryOutletDistributionInactive = await db
      .select({
        outlet_id: mOutlets.id,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at) && eq(mOutlets.is_active, 0));

    totalOutletInactive = queryOutletDistributionInactive.length;

    const totalOutletType = await db
      .select({
        sio_type: mOutlets.sio_type,
        count: sql<number>`count(${mOutlets.id})::int`,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at))
      .groupBy(mOutlets.sio_type);

    return {
      outletDistribution: {
        totalOutlet: totalOutlet,
        totalOutletActive: totalOutletActive,
        totalOutletInactive: totalOutletInactive,
      },
      outletDistributionType: {
        totalOutletType: totalOutletType,
      },
    };
  }

  async getAllComponent() {
    const db = this.drizzleService['db'];

    let timeMotion = 0;

    let totalOutlet = 0;
    let totalOutletActive = 0;
    let totalOutletInactive = 0;

    let totalRouteSurvey = 0;
    let totalRouteSurveyActive = 0;
    let totalRouteSurveyInactive = 0;

    const queryTimeMotion = await db
      .select({
        time_start: CallPlanSchedule.time_start,
        time_end: CallPlanSchedule.time_end,
        region: mUser.region,
        area: mUser.area,
        user_id: mUser.id,
      })
      .from(CallPlanSchedule)
      .leftJoin(mUser, eq(CallPlanSchedule.user_id, mUser.id))
      .where(isNull(CallPlanSchedule.deleted_at));

    // Group data by region and area
    const regionAreaStats: {
      [key: string]: {
        region: string;
        area: string;
        totalTime: number;
        validRecords: number;
        uniqueUsers: Set<number>;
      };
    } = {};
    let totalTime = 0;
    let validRecords = 0;

    queryTimeMotion.forEach((item) => {
      const key = `${item.region}-${item.area}`;

      if (!regionAreaStats[key]) {
        regionAreaStats[key] = {
          region: item.region,
          area: item.area,
          totalTime: 0,
          validRecords: 0,
          uniqueUsers: new Set(),
        };
      }

      if (item.time_start && item.time_end) {
        const diffInMinutes =
          (item.time_end.getTime() - item.time_start.getTime()) / (1000 * 60);
        regionAreaStats[key].totalTime += diffInMinutes;
        regionAreaStats[key].validRecords++;
        regionAreaStats[key].uniqueUsers.add(item.user_id);

        totalTime += diffInMinutes;
        validRecords++;
      }
    });

    // Calculate averages and format results
    const stats = Object.values(regionAreaStats).map((stat) => ({
      region: stat.region,
      area: stat.area,
      total_user_md: stat.uniqueUsers.size,
      average_time:
        stat.validRecords > 0 ? stat.totalTime / stat.validRecords : 0,
    }));

    timeMotion = validRecords > 0 ? totalTime / validRecords : 0;

    const queryTotalOutlet = await db
      .select({
        outlet_id: mOutlets.id,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at));

    totalOutlet = queryTotalOutlet.length;

    const queryTotalOutletActive = await db
      .select({
        outlet_id: mOutlets.id,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at) && eq(mOutlets.is_active, 1));

    totalOutletActive = queryTotalOutletActive.length;

    const queryTotalOutletInactive = await db
      .select({
        outlet_id: mOutlets.id,
      })
      .from(mOutlets)
      .where(isNull(mOutlets.deleted_at) && eq(mOutlets.is_active, 0));

    totalOutletInactive = queryTotalOutletInactive.length;

    return {
      timeMotion: stats,
      Outlet: {
        totalOutlet: totalOutlet,
        totalOutletActive: totalOutletActive,
        totalOutletInactive: totalOutletInactive,
      },
    };
  }

  async getDashboardBatchTarget(codeBatch: string) {
    const db = this.drizzleService['db'];
    // Get batch data with targets in a single query
    const findBatch = await db
      .select({
        batch_id: Mbatch.id,
        batch_code: Mbatch.code_batch,
        batch_target_id: MbatchTarget.id,
        batch_target_regional: MbatchTarget.regional,
        batch_target_amo: MbatchTarget.amo,
        batch_target_brand: MbatchTarget.brand,
        batch_target_sio_type: MbatchTarget.sio_type,
        batch_target_brand_type_sio: MbatchTarget.brand_type_sio,
        batch_target_amo_brand_type: MbatchTarget.amo_brand_type,
        batch_target_total_master: MbatchTarget.total_master,
        batch_target_allocation_ho: MbatchTarget.allocation_ho,
        actual_outlet: drizzleCount(mOutlets.id),
      })
      .from(Mbatch)
      .innerJoin(MbatchTarget, eq(Mbatch.id, MbatchTarget.batch_id))
      .leftJoin(CallPlan, eq(CallPlan.code_batch, Mbatch.code_batch))
      .leftJoin(
        mOutlets,
        and(
          eq(mOutlets.area, MbatchTarget.amo),
          eq(mOutlets.region, MbatchTarget.regional),
          eq(mOutlets.brand, MbatchTarget.brand),
          eq(mOutlets.sio_type, MbatchTarget.sio_type),
        ),
      )
      .where(
        and(
          eq(Mbatch.code_batch, codeBatch),
          isNull(Mbatch.deleted_at),
          isNull(MbatchTarget.deleted_at),
        ),
      )
      .groupBy(
        Mbatch.id,
        Mbatch.code_batch,
        MbatchTarget.id,
        MbatchTarget.regional,
        MbatchTarget.amo,
        MbatchTarget.brand,
        MbatchTarget.sio_type,
        MbatchTarget.brand_type_sio,
        MbatchTarget.amo_brand_type,
        // MbatchTarget.total_master,
        MbatchTarget.allocation_ho,
      );

    // Map results to desired output format
    return findBatch.map((item) => ({
      batch_id: item.batch_id,
      batch_target_id: item.batch_target_id,
      batch_target_regional: item.batch_target_regional,
      batch_target_amo: item.batch_target_amo,
      batch_target_brand: item.batch_target_brand,
      batch_target_sio_type: item.batch_target_sio_type,
      batch_target_brand_type_sio: item.batch_target_brand_type_sio,
      batch_target_amo_brand_type: item.batch_target_amo_brand_type,
      batch_target_total_master: item.batch_target_total_master,
      batch_target_allocation_ho: item.batch_target_allocation_ho,
      actual_outlet: Number(item.actual_outlet) || 0,
      gap_allocation: Number(item.actual_outlet) - Number(item.batch_target_allocation_ho) || 0,
    }));
  }

  async getOutletByFilter(filter: {
    region: string;
    area: string;
    brand: string;
    sio_type: string;
  }) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    const baseConditions = [
      isNull(mOutlets.deleted_at),
      eq(mOutlets.is_active, 1),
    ];

    if (filter.region) {
      baseConditions.push(eq(mOutlets.region, filter.region));
    }

    if (filter.area) {
      baseConditions.push(eq(mOutlets.area, filter.area));
    }
    if (filter.brand) {
      baseConditions.push(eq(mOutlets.brand, filter.brand));
    }
    if (filter.sio_type) {
      baseConditions.push(eq(mOutlets.sio_type, filter.sio_type));
    }

    const totalRecordsResult = await db
      .select({ count: count() })
      .from(mOutlets)
      .where(and(...baseConditions));

    const totalRecords = totalRecordsResult[0]?.count ?? 0;

    const result = await db
      .select({
        id: mOutlets.id,
        brand: mOutlets.brand,
        latitude: mOutlets.latitude,
        longitude: mOutlets.longitude,
        sio_type: mOutlets.sio_type,
        region: mOutlets.region,
        area: mOutlets.area,
        color: MBrand.color,
      })
      .from(mOutlets)
      .leftJoin(MBrand, eq(mOutlets.brand, MBrand.brand))
      .where(and(...baseConditions));

    return {
      data: result,
      totalItems: totalRecords,
    };
  }

  async getMdDashboard(user_id: string, filter: string) {
    const db = this.drizzleService['db'];
    const idDecrypt = decrypt(user_id);
    
    const dateNow = new Date();
    dateNow.setHours(0, 0, 0, 0);

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    // Set date range based on filter type
    if (filter === 'weekly') {
      startDate.setDate(dateNow.getDate() - 7);
    } else if (filter === 'all') {
      startDate = new Date(0); // Beginning of time
    }

    const result = await db
      .select({
        status: CallPlanSchedule.status,
        updated_at: CallPlanSchedule.updated_at,
      })
      .from(CallPlanSchedule)
      .where(
        and(
          eq(CallPlanSchedule.user_id, Number(idDecrypt)),
          gte(CallPlanSchedule.updated_at, startDate),
        ),
      );

    let belum_dikunjungi = 0;
    let sudah_dikunjungi = 0;

    result.map((item) => {
      if (item.status === 400) {
        belum_dikunjungi++;
      } else if (item.status === 200) {
        sudah_dikunjungi++;
      }
    });

    const activity = await db
      .select({
        id: Activity.id,
        outlet_id: Activity.outlet_id,
        survey_outlet_id: Activity.survey_outlet_id,
        created_at: Activity.created_at,
      })
      .from(Activity)
      .where(
        and(
          eq(Activity.user_id, idDecrypt), 
          gte(Activity.created_at, startDate)
        ),
      );

    let total_activity_outlet = 0;
    let total_activity_survey = 0;

    activity.map((item) => {
      if (item.outlet_id) {
        total_activity_outlet++;
      }
      if (item.survey_outlet_id) {
        total_activity_survey++;
      }
    });

    const data = {
      belum_dikunjungi: belum_dikunjungi,
      sudah_dikunjungi: sudah_dikunjungi,
      total_schedule: belum_dikunjungi + sudah_dikunjungi,
      total_activity_outlet: total_activity_outlet,
      total_activity_survey: total_activity_survey,
    };

    return data;
  }
}
