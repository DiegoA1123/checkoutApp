export interface PaymentGatewayPort {
  createPaymentSource(input: {
    cardToken: string;
    customerEmail: string;
  }): Promise<{ paymentSourceId: number; raw: any }>;

  createTransaction(input: {
    reference: string;
    amountInCents: number;
    currency: 'COP';
    customerEmail: string;
    paymentSourceId: number;
  }): Promise<{
    gatewayTransactionId: string;
    status: string;
    raw: any;
  }>;

  getTransactionStatus(gatewayTransactionId: string): Promise<any>;
}
