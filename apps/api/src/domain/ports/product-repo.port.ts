import { Product } from '@prisma/client';

export interface ProductRepoPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  decreaseStock(productId: string): Promise<void>;
}
