import { IsEmail, IsString, MinLength } from 'class-validator';

export class PayTransactionDto {
  @IsEmail()
  customerEmail!: string;

  @IsString()
  @MinLength(5)
  cardToken!: string; // tok_stagtest_...
}
