import { RequestValidationError } from '@globals/helpers/error-handler';
import { Request } from 'express';
import { AnyZodObject } from 'zod';

type ZodDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function zodValidation(schema: AnyZodObject): ZodDecorator {
  return (_target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];

      const zodObject = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!zodObject.success) {
        throw new RequestValidationError(zodObject.error.issues);
      }
      req.body = zodObject.data.body;
      req.query = zodObject.data.query;
      req.params = zodObject.data.params;

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
