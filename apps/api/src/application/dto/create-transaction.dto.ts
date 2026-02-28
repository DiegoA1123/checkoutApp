import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

class CustomerDto {
  @IsString() @IsNotEmpty() fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
}

class DeliveryDto {
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() notes?: string;
}

export class CreateTransactionDto {
  @IsString() @IsNotEmpty() productId!: string;
  customer!: CustomerDto;
  delivery!: DeliveryDto;
}
