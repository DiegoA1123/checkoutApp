export class DomainError extends Error {}

export class OutOfStockError extends DomainError {
  constructor() {
    super('Product out of stock');
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(`${entity} not found`);
  }
}

export class InvalidStateError extends DomainError {
  constructor(msg = 'Invalid transaction state') {
    super(msg);
  }
}
