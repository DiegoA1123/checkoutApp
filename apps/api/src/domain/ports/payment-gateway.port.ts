export interface PaymentGatewayPort {
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
}
