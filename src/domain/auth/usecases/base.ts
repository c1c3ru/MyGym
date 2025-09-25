// Base use case interface and implementations

export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export abstract class BaseUseCase<TInput, TOutput> implements UseCase<TInput, TOutput> {
  abstract execute(input: TInput): Promise<TOutput>;
  
  protected validateInput(input: TInput, schema: any): TInput {
    const result = schema.safeParse(input);
    if (!result.success) {
      const validationErrors = result.error.errors.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      );
      throw new ValidationError(validationErrors);
    }
    return result.data;
  }
}

import { ValidationError } from '@components/errors';