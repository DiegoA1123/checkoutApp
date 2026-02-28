import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CreateTransactionDto } from '../../../application/dto/create-transaction.dto';
import { PayTransactionDto } from '../../../application/dto/pay-transaction.dto';
import { CreatePendingTransactionUseCase } from '../../../application/usecases/create-pending-transaction.usecase';
import { PayTransactionUseCase } from '../../../application/usecases/pay-transaction.usecase';
import * as transactionRepoPort from '../../../domain/ports/transaction-repo.port';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private config: ConfigService,
    private createPending: CreatePendingTransactionUseCase,
    private payTx: PayTransactionUseCase,
    @Inject('TransactionRepoPort')
    private transactionRepository: transactionRepoPort.TransactionRepoPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    const baseFee = Number(this.config.get('BASE_FEE_') ?? 4900);
    const deliveryFee = Number(
      this.config.get('DEFAULT_DELIVERY_FEE_') ?? 12000,
    );

    const result = await this.createPending.execute({
      productId: dto.productId,
      customer: dto.customer,
      delivery: dto.delivery,
      fees: { baseFee, deliveryFee },
    });

    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }
    return result.value;
  }

  @Post(':id/pay')
  async pay(@Param('id') id: string, @Body() dto: PayTransactionDto) {
    const result = await this.payTx.execute({
      transactionId: id,
      card: dto.card,
    });
    if (!result.ok) {
      throw new BadRequestException(result.error.message);
    }
    return result.value;
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.transactionRepository.findById(id);
  }
}
