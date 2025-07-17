import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { BatchRepository } from '../repository/batch.repository';
import { CreateBatchDto, UpdateBatchDto } from '../dtos/batch.dtos';
import { logger } from 'nestjs-i18n';
import { OutletRepository } from '../../outlet/repository/outlet.repository';
import { BatchTargetRepository } from '../repository/batchtarget.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly batchTargetRepository: BatchTargetRepository,
    private readonly jwtService: JwtService,
    private readonly outletRepository: OutletRepository,
  ) {}

  async createData(createBatchDto: CreateBatchDto) {
    try {
      // Create new batch
      const newBatch = await this.batchRepository.create(createBatchDto);
      
      // if (!newBatch || newBatch.length === 0) {
      //   throw new BadRequestException('Failed to create batch');
      // }

      // const batchId = newBatch[0].id;
      
      // // Get outlet summary for targets
      // const outletSummary = await this.outletRepository.getOutletSummary();
      // if (!outletSummary || outletSummary.length === 0) {
      //   logger.warn('No outlet summary data found for batch targets');
      //   return newBatch;
      // }

      // // Create batch targets with validation
      // const batchTargetPromises = outletSummary
      //   .filter(target => {
      //     // Filter out records with empty or null required fields
      //     return target.regional && 
      //            target.area && 
      //            target.brand && 
      //            target.sio_type && 
      //            target.brand_type_sio && 
      //            target.brand_type_outlet;
      //   })
      //   .map(target => 
      //     this.batchTargetRepository.createDummy({
      //       batch_id: batchId,
      //       regional: target.regional,
      //       amo: target.area,
      //       brand: target.brand,
      //       sio_type: target.sio_type,
      //       brand_type_sio: target.brand_type_sio,
      //       amo_brand_type: target.brand_type_outlet,
      //     })
      //   );
      
      // if (batchTargetPromises.length > 0) {
      //   await Promise.all(batchTargetPromises);
      // }

      return newBatch;
    } catch (error) {
      logger.error('Error in create batch:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new InternalServerErrorException('Failed to create batch data');
      }
    }
  }

  async getDataById(id: number) {
    const batch = await this.batchRepository.getById(id);
    if (!batch) {
      throw new NotFoundException(`Batch with id ${id} not found`);
    }
    return batch;
  }

  async updateData(id: string, updateBatchDto: UpdateBatchDto) {
    try {
      const updated = await this.batchRepository.update(id, updateBatchDto);
      if (!updated) {
        throw new NotFoundException(`Batch with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      logger.error('Error updating batch:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update batch data');
    }
  }

  async deleteData(id: string, accessToken: string): Promise<void> {
    try {
      const decoded = this.jwtService.verify(accessToken);
      if (!decoded) {
        throw new BadRequestException('Invalid access token');
      }
      await this.batchRepository.delete(id, decoded.email);
    } catch (error) {
      logger.error('Error deleting batch:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete batch data');
    }
  }

  async getAllRolesList() {
    try {
      return await this.batchRepository.getList();
    } catch (error) {
      logger.error('Error getting roles list:', error.message, error.stack);
      throw new InternalServerErrorException('Failed to get roles list');
    }
  }

  async getAllActiveData(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    try {
      return await this.batchRepository.getAllActive(page, limit, searchTerm);
    } catch (error) {
      logger.error('Error getting active data:', error.message, error.stack);
      throw new InternalServerErrorException('Failed to get active batch data');
    }
  }
}
