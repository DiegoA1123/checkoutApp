import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDto {
  @IsString() @IsNotEmpty() fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(7) phone!: string;
}

export class DeliveryDto {
  @IsString() @IsNotEmpty() address!: string;
  @IsString() @IsNotEmpty() city!: string;
  @IsString() notes?: string;
}

export class CreateTransactionDto {
  @IsString() @IsNotEmpty() productId!: string;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer!: CustomerDto;

  @ValidateNested()
  @Type(() => DeliveryDto)
  delivery!: DeliveryDto;
}
