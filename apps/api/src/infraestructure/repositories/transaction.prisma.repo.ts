import { Injectable } from '@nestjs/common';
import { TransactionRepoPort } from '../../domain/ports/transaction-repo.port';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, Prisma } from '@prisma/client';

@Injectable()
export class TransactionPrismaRepo implements TransactionRepoPort {
  constructor(private prisma: PrismaService) {}

  createPending(data: {
    reference: string;
    productId: string;
    customerId: string;
    deliveryId: string;
    productAmount: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
  }): Promise<import('@prisma/client').Transaction> {
    return this.prisma.transaction.create({
      data: { ...data, status: TransactionStatus.PENDING },
    }) as unknown as Promise<import('@prisma/client').Transaction>;
  }

  findById(id: string): Promise<import('@prisma/client').Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: { product: true, customer: true, delivery: true },
    }) as unknown as Promise<import('@prisma/client').Transaction | null>;
  }

  updateStatus(
    id: string,
    status: TransactionStatus,
    extra?: {
      gatewayTransactionId?: string | null;
      gatewayRawResponse?: unknown;
    },
  ): Promise<import('@prisma/client').Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        status,
        gatewayTransactionId: extra?.gatewayTransactionId ?? undefined,
        gatewayRawResponse:
          (extra?.gatewayRawResponse as Prisma.InputJsonValue) ?? undefined,
      },
      include: { product: true, customer: true, delivery: true },
    }) as unknown as Promise<import('@prisma/client').Transaction>;
  }
}
