import { IsEmail, IsInt, Min } from 'class-validator';

export class PayTransactionDto {
  @IsInt()
  @Min(1)
  paymentSourceId!: number;

  @IsEmail()
  customerEmail!: string;
}
