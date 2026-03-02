export class PaymentGatewayMock {
  async createPaymentSource() {
    return { paymentSourceId: 99999, raw: { mocked: true } };
  }

  async createTransaction() {
    return {
      gatewayTransactionId: 'gw_mock_1',
      status: 'APPROVED',
      raw: { status: 'APPROVED', mocked: true },
    };
  }

  async getTransactionStatus() {
    return { status: 'APPROVED' };
  }
}
