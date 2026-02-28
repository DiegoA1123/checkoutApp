import { Customer } from '@prisma/client';

export interface CustomerRepoPort {
  upsertByEmail(data: {
    fullName: string;
    email: string;
    phone: string;
  }): Promise<Customer>;
}
