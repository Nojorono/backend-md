import { Injectable } from '@nestjs/common';
import { desc, eq, isNull } from 'drizzle-orm';
import { CallPlanSchedule } from '../../../schema';
import { DrizzleService } from '../../../common/services/drizzle.service';
import { decrypt, encrypt } from '../../../helpers/nojorono.helpers';
import {
  UpdateCallPlanScheduleDto,
  CreateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';

@Injectable()
export class CallPlanScheduleRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async decryptId(id: string) {
    const stringId = id.toString();
    return decrypt(stringId);
  }

  async encryptedId(id: number) {
    return encrypt(id.toString());
  }

  // Create
  async createData(createCallPlanScheduleDto: CreateCallPlanScheduleDto) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(
      createCallPlanScheduleDto.call_plan_id,
    );

    // Destructure values from the DTO
    const {
      code_call_plan,
      outlet_id,
      notes,
      start_plan,
      end_plan,
      created_by,
      user_id,
    } = createCallPlanScheduleDto;

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .insert(CallPlanSchedule)
      .values({
        call_plan_id: idDecrypted,
        code_call_plan,
        outlet_id,
        notes,
        user_id,
        start_plan,
        end_plan,
        created_by,
        created_at: new Date(),
      })
      .returning();
  }

  async findLastId() {
    const db = this.drizzleService['db'];
    if (!db) {
      throw new Error('Database not initialized');
    }
    const lastEntry = await db
      .select()
      .from(CallPlanSchedule)
      .orderBy(desc(CallPlanSchedule.id))
      .limit(1);

    return lastEntry[0] ?? null;
  }

  // Update by ID
  async updateData(
    id: number,
    updateCallPlanScheduleDto: UpdateCallPlanScheduleDto,
  ) {
    const db = this.drizzleService['db'];
    const { outlet_id, notes, start_plan, end_plan, updated_by } =
      updateCallPlanScheduleDto;
    return await db
      .update(CallPlanSchedule)
      .set({
        outlet_id,
        notes,
        start_plan,
        end_plan,
        updated_by,
        updated_at: new Date(),
      })
      .where(eq(CallPlanSchedule.id, id))
      .execute();
  }

  // Get Schedule by callPlanId
  async getByIdCallPlan(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.CallPlanSchedule.findMany({
      where: (CallPlanSchedule, { eq, and }) =>
        and(
          eq(CallPlanSchedule.call_plan_id, idDecrypted),
          isNull(CallPlanSchedule.deleted_at),
        ),
      with: {
        callPlanOutlet: true,
        callPlanUser: true,
      },
    });
  }

  // Get Schedule by callPlanId
  async getByIdUser(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);
    if (!db) {
      throw new Error('Database not initialized');
    }
    return await db.query.CallPlanSchedule.findMany({
      where: (CallPlanSchedule, { eq, and }) =>
        and(
          eq(CallPlanSchedule.user_id, idDecrypted),
          isNull(CallPlanSchedule.deleted_at),
        ),
      with: {
        callPlanOutlet: true,
        callPlanUser: true,
      },
    });
  }

  // Get User by id
  async getCallPlanByUserId(id: string) {
    const db = this.drizzleService['db'];
    const idDecrypted = await this.decryptId(id);

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db.query.CallPlan.findMany({
      where: (CallPlan, { eq }) => eq(CallPlan.user_id, idDecrypted),
      with: {
        callPlan: true,
      },
    });
  }

  async deleteById(id: number, userEmail: string) {
    const db = this.drizzleService['db'];

    if (!db) {
      throw new Error('Database not initialized');
    }

    return await db
      .update(CallPlanSchedule)
      .set({
        updated_at: new Date(),
        deleted_at: new Date(),
        deleted_by: userEmail,
      })
      .where(eq(CallPlanSchedule.id, id))
      .returning();
  }
}
