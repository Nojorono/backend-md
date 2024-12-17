import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/common/services/drizzle.service';
import { and, count as drizzleCount, eq, isNull } from 'drizzle-orm';
import { Mbatch, MbatchTarget, Activity, CallPlan } from '../../../schema';

@Injectable()
export class DashboardService {
  constructor(private readonly drizzleService: DrizzleService) {}
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
        activity_count: drizzleCount(Activity.id),
      })
      .from(Mbatch)
      .innerJoin(MbatchTarget, eq(Mbatch.id, MbatchTarget.batch_id))
      .leftJoin(CallPlan, eq(CallPlan.code_batch, Mbatch.code_batch))
      .leftJoin(
        Activity,
        and(
          eq(Activity.call_plan_id, CallPlan.id),
          eq(Activity.area, MbatchTarget.amo),
          eq(Activity.region, MbatchTarget.regional),
          eq(Activity.brand, MbatchTarget.brand),
          eq(Activity.type_sio, MbatchTarget.sio_type),
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
      activity_count: Number(item.activity_count) || 0,
    }));
  }
}
