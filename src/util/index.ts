import { Context, Middleware, Next } from 'koa';
import { RegisterSpec, ValidationOptions } from 'src/types';

function flatten(array: Array<any>): Array<any> {
  return array.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc.concat(flatten(curr));
    }
    return acc.concat(curr);
  }, []);
}

export const prepareMiddleware = (input?: Middleware | Middleware[]): Middleware[] => {
  if (!input) {
    return [];
  }

  if (!Array.isArray(input)) {
    return [input];
  } else {
    return flatten(input);
  }
};

export async function noopMiddleware(ctx: Context, next: Next) {
  return await next();
}

export const validationMiddleware = (validation?: ValidationOptions) => {
  if (!validation) {
    return noopMiddleware;
  }

  const props = ['header', 'query', 'params', 'body'];

  return async (ctx: Context, next: Next) => {
    console.log('validator middleware');

    // implement input validations here

    await next();

    // implement output validations here
  };
};
