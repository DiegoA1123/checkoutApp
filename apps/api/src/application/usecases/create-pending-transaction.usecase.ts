import { Injectable, Inject } from '@nestjs/common';
import { Err, Ok, Result } from '../result';
import {
  OutOfStockError,
  NotFoundError,
} from '../../domain/errors/domain-errors';
import * as productRepoPort from '../../domain/ports/product-repo.port';
import * as customerRepoPort from '../../domain/ports/customer-repo.port';
import * as deliveryRepoPort from '../../domain/ports/delivery-repo.port';
import * as transactionRepoPort from '../../domain/ports/transaction-repo.port';

type Output = {
  transactionId: string;
  reference: string;
  breakdown: {
    productAmount: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
  };
};

@Injectable()
export class CreatePendingTransactionUseCase {
  constructor(
    @Inject('ProductRepoPort')
    private productRepository: productRepoPort.ProductRepoPort,
    @Inject('CustomerRepoPort')
    private customerRepository: customerRepoPort.CustomerRepoPort,
    @Inject('DeliveryRepoPort')
    private deliveryRepository: deliveryRepoPort.DeliveryRepoPort,
    @Inject('TransactionRepoPort')
    private transactionRepository: transactionRepoPort.TransactionRepoPort,
  ) {}

  async execute(input: {
    productId: string;
    customer: { fullName: string; email: string; phone: string };
    delivery: { address: string; city: string; notes?: string | null };
    fees: { baseFee: number; deliveryFee: number };
  }): Promise<Result<Output, Error>> {
    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return Err(new NotFoundError('Product'));
    }

    if (product.stock <= 0) {
      return Err(new OutOfStockError());
    }

    const customer = await this.customerRepository.upsertByEmail(
      input.customer,
    );

    const delivery = await this.deliveryRepository.create({
      customerId: customer.id,
      address: input.delivery.address,
      city: input.delivery.city,
      notes: input.delivery.notes ?? null,
      feeTotal: input.fees.deliveryFee,
    });

    const reference = `ref_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const productAmount = product.price;
    const baseFee = input.fees.baseFee;
    const deliveryFee = input.fees.deliveryFee;
    const totalAmount = productAmount + baseFee + deliveryFee;

    const tx = await this.transactionRepository.createPending({
      reference,
      productId: product.id,
      customerId: customer.id,
      deliveryId: delivery.id,
      productAmount,
      baseFee,
      deliveryFee,
      totalAmount,
    });

    return Ok({
      transactionId: tx.id,
      reference: tx.reference,
      status: tx.status,
      breakdown: {
        productAmount,
        baseFee,
        deliveryFee,
        totalAmount,
      },
    });
  }
}
