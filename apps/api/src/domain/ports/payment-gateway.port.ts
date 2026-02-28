export interface PaymentGatewayPort {
  pay(input: {
    reference: string;
    amount: number;
    card: {
      number: string;
      expMonth: string;
      expYear: string;
      cvc: string;
      holder: string;
    };
  }): Promise<{
    status: 'APPROVED' | 'DECLINED' | 'ERROR';
    gatewayId?: string;
    raw?: any;
  }>;
}
