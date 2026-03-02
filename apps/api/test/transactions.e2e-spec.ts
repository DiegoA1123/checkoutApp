import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PayTransactionUseCase } from '../src/application/usecases/pay-transaction.usecase';

describe('Transactions (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('PaymentGatewayPort')
      .useValue({
        createPaymentSource: async () => ({ paymentSourceId: 9999, raw: {} }),
        createTransaction: async () => ({
          gatewayTransactionId: 'gw_mock_1',
          status: 'APPROVED',
          raw: { status: 'APPROVED' },
        }),
        getTransactionStatus: async () => ({
          id: 'gw_mock_1',
          status: 'APPROVED',
        }),
      })
      .compile();

    // ✅ Verifica que el override exista (si falla, token mismatch)
    const gw = moduleRef.get('PaymentGatewayPort');
    expect(gw).toBeDefined();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create pending transaction and pay', async () => {
    const productsRes = await request(app.getHttpServer()).get('/products');
    expect(productsRes.status).toBe(200);
    const productId = productsRes.body?.[0]?.id;
    expect(productId).toBeTruthy();

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        productId,
        customer: {
          fullName: 'Test User',
          email: 'test@mail.com',
          phone: '3000000000',
        },
        delivery: { address: 'Calle 1', city: 'MEDELLIN', notes: '' },
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.status).toBe('PENDING');

    const txId = createRes.body.transactionId;

    const payRes = await request(app.getHttpServer())
      .post(`/transactions/${txId}/pay`)
      .send({ cardToken: 'tok_mock', customerEmail: 'test@mail.com' });

    if (![200, 201].includes(payRes.status)) {
      console.log('payRes:', payRes.status, payRes.body);
    }

    expect([200, 201]).toContain(payRes.status);
    expect(payRes.body.status).toBe('APPROVED');
  });
});
