import { IsNotEmpty, IsString, Length } from 'class-validator';

class CardDto {
  @IsString() @IsNotEmpty() number!: string;
  @IsString() @Length(2, 2) expMonth!: string;
  @IsString() @Length(2, 2) expYear!: string;
  @IsString() @Length(3, 4) cvc!: string;
  @IsString() @IsNotEmpty() holder!: string;
}

export class PayTransactionDto {
  card!: CardDto;
}
