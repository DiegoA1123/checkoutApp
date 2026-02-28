import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';

interface MerchantResponse {
  data: {
    presigned_acceptance?: {
      acceptance_token: string;
    };
  };
}

interface GatewayResponse {
  data: {
    id: string;
    status: string;
  };
}

@Injectable()
export class PaymentGatewayService implements PaymentGatewayPort {
  private baseUrl: string;
  private publicKey: string;
  private privateKey: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('PAYMENT_BASE_URL')!;
    this.publicKey = this.config.get<string>('PAYMENT_PUBLIC_KEY')!;
    this.privateKey = this.config.get<string>('PAYMENT_PRIVATE_KEY')!;
  }

  private async getAcceptanceToken(): Promise<string> {
    const url = `${this.baseUrl}/merchants/${this.publicKey}`;
    const res = await firstValueFrom(this.http.get<MerchantResponse>(url));
    const token = res.data?.data?.presigned_acceptance?.acceptance_token;
    if (!token) throw new Error('Gateway acceptance_token not found');
    return token;
  }

  async createTransaction(input: {
    reference: string;
    amountInCents: number;
    currency: 'COP';
    customerEmail: string;
    paymentSourceId: number;
  }) {
    const acceptance_token = await this.getAcceptanceToken();

    const url = `${this.baseUrl}/transactions`;
    const payload = {
      acceptance_token,
      amount_in_cents: input.amountInCents,
      currency: input.currency,
      customer_email: input.customerEmail,
      reference: input.reference,

      payment_method: { type: 'CARD', installments: 1 },

      payment_source_id: input.paymentSourceId,
    };

    const res = await firstValueFrom(
      this.http.post<GatewayResponse>(url, payload, {
        headers: { Authorization: `Bearer ${this.privateKey}` },
      }),
    );

    const data = res.data?.data;
    return {
      gatewayTransactionId: data?.id,
      status: data?.status,
      raw: res.data as unknown,
    };
  }
}
