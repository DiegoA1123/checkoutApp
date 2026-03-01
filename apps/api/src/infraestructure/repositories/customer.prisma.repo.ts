import { Injectable } from '@nestjs/common';
import { CustomerRepoPort } from '../../domain/ports/customer-repo.port';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerPrismaRepo implements CustomerRepoPort {
  constructor(private prisma: PrismaService) {}

  upsertByEmail(data: { fullName: string; email: string; phone: string }) {
    return this.prisma.customer.upsert({
      where: { email: data.email },
      update: { fullName: data.fullName, phone: data.phone },
      create: { fullName: data.fullName, email: data.email, phone: data.phone },
    });
  }
}
