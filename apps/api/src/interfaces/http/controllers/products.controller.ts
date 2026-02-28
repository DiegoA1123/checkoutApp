import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as productRepoPort from '../../../domain/ports/product-repo.port';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productRepository: productRepoPort.ProductRepoPort) {}

  @Get()
  list() {
    return this.productRepository.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.productRepository.findById(id);
  }
}
