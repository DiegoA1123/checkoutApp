import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';

interface MerchantResponse {
  data: {
    presigned_acceptance?: {
      acceptance_token: string;
    };
  };
}

@Injectable()
export class PaymentGatewayService implements PaymentGatewayPort {
  private baseUrl: string;
  private publicKey: string;
  private privateKey: string;
  private integrityKey: string;

  constructor(
    private http: HttpService,
    private config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('PAYMENT_BASE_URL')!;
    this.publicKey = this.config.get<string>('PAYMENT_PUBLIC_KEY')!;
    this.privateKey = this.config.get<string>('PAYMENT_PRIVATE_KEY')!;
    this.integrityKey = this.config.get<string>('PAYMENT_INTEGRITY_KEY')!;

    if (
      !this.baseUrl ||
      !this.publicKey ||
      !this.privateKey ||
      !this.integrityKey
    ) {
      throw new Error(
        'Missing PAYMENT_* env vars (BASE_URL, PUBLIC_KEY, PRIVATE_KEY, INTEGRITY_KEY)',
      );
    }
  }

  private async getAcceptanceToken(): Promise<string> {
    const url = `${this.baseUrl}/merchants/${this.publicKey}`;
    const res = await firstValueFrom(this.http.get<MerchantResponse>(url));
    const token = res.data?.data?.presigned_acceptance?.acceptance_token;
    if (!token) throw new Error('Gateway acceptance_token not found');
    return token;
  }

  private sign(reference: string, amountInCents: number, currency: string) {
    const raw = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async createPaymentSource(input: {
    cardToken: string;
    customerEmail: string;
  }) {
    const acceptance_token = await this.getAcceptanceToken();
    const url = `${this.baseUrl}/payment_sources`;

    const payload = {
      type: 'CARD',
      token: input.cardToken,
      customer_email: input.customerEmail,
      acceptance_token,
    };

    try {
      const res = await firstValueFrom(
        this.http.post<any>(url, payload, {
          headers: { Authorization: `Bearer ${this.privateKey}` },
        }),
      );

      const id = res.data?.data?.id;
      if (!id) throw new Error('payment_source_id not returned by Wompi');

      return { paymentSourceId: Number(id), raw: res.data };
    } catch (err: any) {
      console.error(
        'WOMPI payment_sources ERROR:',
        err?.response?.status,
        err?.response?.data,
      );
      throw err;
    }
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

    const signature = this.sign(
      input.reference,
      input.amountInCents,
      input.currency,
    );

    const payload = {
      acceptance_token,
      amount_in_cents: input.amountInCents,
      currency: input.currency,
      customer_email: input.customerEmail,
      reference: input.reference,
      payment_method: { type: 'CARD', installments: 1 },
      payment_source_id: input.paymentSourceId,
      signature,
    };

    try {
      const res = await firstValueFrom(
        this.http.post<any>(url, payload, {
          headers: { Authorization: `Bearer ${this.privateKey}` },
        }),
      );

      const data = res.data?.data;
      return {
        gatewayTransactionId: data?.id,
        status: data?.status,
        raw: res.data,
      };
    } catch (err: any) {
      console.error(
        'WOMPI transactions ERROR:',
        err?.response?.status,
        err?.response?.data,
      );
      throw err;
    }
  }

  async getTransactionStatus(gatewayTransactionId: string) {
    const url = `${this.baseUrl}/transactions/${gatewayTransactionId}`;
    const res = await firstValueFrom(
      this.http.get<any>(url, {
        headers: { Authorization: `Bearer ${this.privateKey}` },
      }),
    );
    return res.data?.data;
  }
}
