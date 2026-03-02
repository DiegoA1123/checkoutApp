import { Inject, Injectable } from '@nestjs/common';
import { Transaction, TransactionStatus } from '@prisma/client';
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
    @Inject('TransactionRepoPort')
    private transactionRepository: transactionRepoPort.TransactionRepoPort,
    @Inject('ProductRepoPort')
    private productRepository: productRepoPort.ProductRepoPort,
    @Inject('PaymentGatewayPort')
    private paymentGateway: paymentGatewayPort.PaymentGatewayPort,
  ) {}

  async execute(input: {
    transactionId: string;
    cardToken: string;
    customerEmail: string;
  }): Promise<Result<Transaction, Error>> {
    const tx = await this.transactionRepository.findById(input.transactionId);
    if (!tx) return Err(new NotFoundError('Transaction'));
    if (tx.status !== TransactionStatus.PENDING)
      return Err(
        new InvalidStateError('La transacción no está en estado PENDING'),
      );

    const product = await this.productRepository.findById(tx.productId);
    if (!product) return Err(new NotFoundError('Product'));
    if (product.stock <= 0) return Err(new OutOfStockError());

    const { paymentSourceId } = await this.paymentGateway.createPaymentSource({
      cardToken: input.cardToken,
      customerEmail: input.customerEmail,
    });
    const gatewayResponse = await this.paymentGateway.createTransaction({
      reference: tx.reference,
      amountInCents: tx.totalAmount,
      currency: 'COP',
      customerEmail: input.customerEmail,
      paymentSourceId,
    });

    const gatewayStatus = String(gatewayResponse.status || '').toUpperCase();
    const mapped =
      gatewayStatus === 'APPROVED'
        ? TransactionStatus.APPROVED
        : gatewayStatus === 'DECLINED'
          ? TransactionStatus.DECLINED
          : gatewayStatus === 'PENDING'
            ? TransactionStatus.PENDING
            : TransactionStatus.ERROR;

    const updated = await this.transactionRepository.updateStatus(
      tx.id,
      mapped,
      {
        gatewayTransactionId: gatewayResponse.gatewayTransactionId ?? null,
        gatewayRawResponse: gatewayResponse.raw ?? null,
      },
    );

    if (mapped === TransactionStatus.APPROVED) {
      await this.productRepository.decreaseStock(tx.productId);
    }

    return Ok(updated);
  }
}
