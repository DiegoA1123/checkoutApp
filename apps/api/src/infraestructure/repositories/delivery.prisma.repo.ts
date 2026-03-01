import { Injectable } from '@nestjs/common';
import { DeliveryRepoPort } from '../../domain/ports/delivery-repo.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryPrismaRepo implements DeliveryRepoPort {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    customerId: string;
    address: string;
    city: string;
    notes?: string | null;
    feeTotal: number;
  }): Promise<import('@prisma/client').Delivery> {
    return this.prisma.delivery.create({ data });
  }
}
