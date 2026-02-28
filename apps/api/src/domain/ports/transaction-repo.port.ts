import { Transaction, TransactionStatus } from '@prisma/client';

export interface TransactionRepoPort {
  createPending(data: {
    reference: string;
    productId: string;
    customerId: string;
    deliveryId: string;
    productAmount: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
  }): Promise<Transaction>;

  findById(id: string): Promise<Transaction | null>;

  updateStatus(
    id: string,
    status: TransactionStatus,
    extra?: { gatewayTransactionId?: string | null; gatewayRawResponse?: any },
  ): Promise<Transaction>;
}
