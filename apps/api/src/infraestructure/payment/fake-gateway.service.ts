import { Injectable } from '@nestjs/common';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';

@Injectable()
export class FakeGatewayService implements PaymentGatewayPort {
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
    raw?: unknown;
  }> {
    const last4 = String(input.card.number).slice(-4);
    if (last4 === '4242') {
      return Promise.resolve({
        status: 'APPROVED',
        gatewayId: `fake_${Date.now()}`,
        raw: { approved: true },
      });
    }
    return Promise.resolve({
      status: 'DECLINED',
      gatewayId: `fake_${Date.now()}`,
      raw: { approved: false },
    });
  }
}
