import { Injectable } from '@nestjs/common';
import { ProductRepoPort } from '../../domain/ports/product-repo.port';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';

@Injectable()
export class ProductPrismaRepo implements ProductRepoPort {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({ orderBy: { createdAt: 'asc' } });
  }

  findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async decreaseStock(productId: string): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: 1 } },
    });
  }
}
