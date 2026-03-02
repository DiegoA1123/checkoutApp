import { Inject, Injectable } from '@nestjs/common';
import { Transaction, TransactionStatus } from '@prisma/client';
import { Err, Ok, Result } from '../result';
import { NotFoundError } from '../../domain/errors/domain-errors';
import * as paymentGatewayPort from '../../domain/ports/payment-gateway.port';
import * as transactionRepoPort from '../../domain/ports/transaction-repo.port';

@Injectable()
export class SyncTransactionUseCase {
  constructor(
    @Inject('TransactionRepoPort')
    private transactionRepository: transactionRepoPort.TransactionRepoPort,
    @Inject('PaymentGatewayPort')
    private paymentGateway: paymentGatewayPort.PaymentGatewayPort,
  ) {}

  async execute(input: {
    transactionId: string;
  }): Promise<Result<Transaction, Error>> {
    const tx = await this.transactionRepository.findById(input.transactionId);
    if (!tx) return Err(new NotFoundError('Transaction'));

    if (!tx.gatewayTransactionId) return Ok(tx);

    const gw = await this.paymentGateway.getTransactionStatus(
      tx.gatewayTransactionId,
    );

    const gatewayStatus = String(gw?.status || '').toUpperCase();
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
        gatewayRawResponse: gw ?? null,
      },
    );

    return Ok(updated);
  }
}
