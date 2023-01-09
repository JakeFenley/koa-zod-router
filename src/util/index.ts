import { Context, Middleware, Next } from 'koa';
import { Spec } from 'src/types';

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

export const validator = (spec: Spec) => {
  const props = ['header', 'query', 'params', 'body'];

  return async (ctx: Context, next: Next) => {
    if (!spec.validate) {
      return await next();
    }

    // implement input validations here

    await next();

    // implement output validations here
  };
};
