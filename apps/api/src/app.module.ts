import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './infraestructure/prisma/prisma.service';

import { ProductsController } from './interfaces/http/controllers/products.controller';
import { TransactionsController } from './interfaces/http/controllers/transactions.controller';

import { ProductPrismaRepo } from './infraestructure/repositories/product.prisma.repo';
import { CustomerPrismaRepo } from './infraestructure/repositories/customer.prisma.repo';
import { DeliveryPrismaRepo } from './infraestructure/repositories/delivery.prisma.repo';
import { TransactionPrismaRepo } from './infraestructure/repositories/transaction.prisma.repo';
import { HttpModule } from '@nestjs/axios';

import { CreatePendingTransactionUseCase } from './application/usecases/create-pending-transaction.usecase';
import { PayTransactionUseCase } from './application/usecases/pay-transaction.usecase';
import { PaymentGatewayService } from './infraestructure/payment/payment-gateway.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule,
  ],
  controllers: [ProductsController, TransactionsController],
  providers: [
    PrismaService,

    { provide: 'ProductRepoPort', useClass: ProductPrismaRepo },
    { provide: 'CustomerRepoPort', useClass: CustomerPrismaRepo },
    { provide: 'DeliveryRepoPort', useClass: DeliveryPrismaRepo },
    { provide: 'TransactionRepoPort', useClass: TransactionPrismaRepo },
    { provide: 'PaymentGatewayPort', useClass: PaymentGatewayService },
    CreatePendingTransactionUseCase,
    PayTransactionUseCase,
  ],
})
export class AppModule {}
