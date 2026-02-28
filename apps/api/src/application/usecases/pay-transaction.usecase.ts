import { Injectable } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { Err, Ok, Result } from '../result';
import {
  InvalidStateError,
  NotFoundError,
  OutOfStockError,
} from '../../domain/errors/domain-errors';
import * as paymentGatewayPort from '../../domain/ports/payment-gateway.port';
import * as transactionRepoPort from '../../domain/ports/transaction-repo.port';
import * as productRepoPort from '../../domain/ports/product-repo.port';

@Injectable()
export class PayTransactionUseCase {
  constructor(
    private transactionRepository: transactionRepoPort.TransactionRepoPort,
    private productRepository: productRepoPort.ProductRepoPort,
    private paymentGateway: paymentGatewayPort.PaymentGatewayPort,
  ) {}

  async execute(input: {
    transactionId: string;
    card: {
      number: string;
      expMonth: string;
      expYear: string;
      cvc: string;
      holder: string;
    };
  }): Promise<Result<any, Error>> {
    const transaction = await this.transactionRepository.findById(
      input.transactionId,
    );
    if (!transaction) {
      return Err(new NotFoundError('Transaction'));
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      return Err(new InvalidStateError('Transaction is not PENDING'));
    }

    const product = await this.productRepository.findById(
      transaction.productId,
    );
    if (!product) {
      return Err(new NotFoundError('Product'));
    }
    if (product.stock <= 0) {
      return Err(new OutOfStockError());
    }

    const response = await this.paymentGateway.pay({
      reference: transaction.reference,
      amount: transaction.totalAmount,
      card: input.card,
    });

    if (response.status === 'APPROVED') {
      await this.productRepository.decreaseStock(transaction.productId);
      const updated = await this.transactionRepository.updateStatus(
        transaction.id,
        TransactionStatus.APPROVED,
        {
          gatewayTransactionId: response.gatewayId ?? null,
          gatewayRawResponse: response.raw ?? null,
        },
      );
      return Ok(updated);
    }

    if (response.status === 'DECLINED') {
      const updated = await this.transactionRepository.updateStatus(
        transaction.id,
        TransactionStatus.DECLINED,
        {
          gatewayTransactionId: response.gatewayId ?? null,
          gatewayRawResponse: response.raw ?? null,
        },
      );
      return Ok(updated);
    }

    const updated = await this.transactionRepository.updateStatus(
      transaction.id,
      TransactionStatus.ERROR,
      {
        gatewayTransactionId: response.gatewayId ?? null,
        gatewayRawResponse: response.raw ?? null,
      },
    );
    return Ok(updated);
  }
}
