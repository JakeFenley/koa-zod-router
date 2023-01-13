import { Context, DefaultState, Middleware, Next } from 'koa';
import { RegisterSpec, Spec, ValidationOptions, ZodContext, ZodMiddleware } from './types';

function flatten<H, P, Q, B, R>(
  middlewares: Array<ZodMiddleware<H, P, Q, B, R> | undefined>,
): Middleware<DefaultState, ZodContext<H, P, Q, B>, R>[] {
  const flattened = middlewares.reduce((acc: Middleware<DefaultState, ZodContext<H, P, Q, B>, R>[], curr) => {
    if (!curr) {
      return acc;
    }

    if (Array.isArray(curr)) {
      return acc.concat(flatten(curr));
    }
    return acc.concat(curr);
  }, []);

  return flattened;
}

export const prepareMiddleware = <H, P, Q, B, R>(
  input: Array<ZodMiddleware<H, P, Q, B, R> | undefined>,
): Middleware<DefaultState, ZodContext<H, P, Q, B>, R>[] => {
  return flatten(input);
};

export async function noopMiddleware(ctx: Context, next: Next) {
  return await next();
}

export const assertString = (val: any): val is string => {
  return typeof val === 'string';
};

export const assertRegex = (val: any): val is RegExp => {
  return val instanceof RegExp;
};

export const assertStringOrRegex = (val: any): val is string | RegExp => {
  if (assertString(val) || assertRegex(val)) {
    return true;
  }

  return false;
};

export const assertMiddlewares = (val: any): val is Middleware | Middleware[] => {
  if (typeof val === 'function') {
    return true;
  }

  if (Array.isArray(val) && typeof val[0] === 'function') {
    return true;
  }

  return false;
};

export const assertPath = (val: any): val is string | RegExp | Array<string | RegExp> => {
  if (assertString(val)) {
    return true;
  }

  if (Array.isArray(val)) {
    if (val[0] instanceof RegExp) {
      return true;
    }

    if (typeof val[0] === 'string') {
      return true;
    }
  }

  return false;
};

export const assertSpec = <H, P, Q, B, R>(val: any): val is Spec<H, P, Q, B, R> | RegisterSpec<H, P, Q, B, R> => {
  if (typeof val === 'object' && val['path']) {
    return true;
  }

  return false;
};

export const assertValidation = <H, P, Q, B, R>(val: any): val is ValidationOptions<H, P, Q, B, R> => {
  const props = ['headers', 'body', 'query', 'params', 'response'];

  if (typeof val === 'object') {
    for (const prop of props) {
      if (val[prop]) {
        return true;
      }
    }
  }

  return false;
};
