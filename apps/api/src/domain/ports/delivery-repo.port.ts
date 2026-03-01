import { Delivery } from '@prisma/client';

export interface DeliveryRepoPort {
  create(data: {
    customerId: string;
    address: string;
    city: string;
    notes?: string | null;
    feeTotal: number;
  }): Promise<Delivery>;
}
