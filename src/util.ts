import { PersistentFile, VolatileFile, errors } from 'formidable';
import { Context, DefaultState, Middleware, Next } from 'koa';
import { z } from 'zod';
import { Method, ValidationOptions, ZodContext, ZodMiddleware } from './types';
const { FormidableError } = errors;

function flatten<H, P, Q, B, F, R>(
  middlewares: Array<ZodMiddleware<H, P, Q, B, F, R> | undefined>,
): Middleware<DefaultState, ZodContext<H, P, Q, B, F>, R>[] {
  const flattened = middlewares.reduce((acc: Middleware<DefaultState, ZodContext<H, P, Q, B, F>, R>[], curr) => {
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

export const prepareMiddleware = <H, P, Q, B, F, R>(
  input: Array<ZodMiddleware<H, P, Q, B, F, R> | undefined>,
): Middleware<DefaultState, ZodContext<H, P, Q, B, F>, R>[] => {
  return flatten(input);
};

export async function noopMiddleware(ctx: Context, next: Next) {
  return await next();
}

export const assertValidation = <H, P, Q, B, F, R>(val: any): val is ValidationOptions<H, P, Q, B, F, R> => {
  const props = ['headers', 'body', 'query', 'params', 'files', 'response'];

  if (typeof val === 'object') {
    for (const prop of props) {
      if (val[prop]) {
        return true;
      }
    }
  }

  return false;
};

export const assertHandlers = <H, P, Q, B, F, R>(val: any): val is ZodMiddleware<H, P, Q, B, F, R> => {
  if (Array.isArray(val)) {
    for (const fn of val) {
      if (typeof fn !== 'function') {
        return false;
      }
    }
  } else if (typeof val !== 'function') {
    return false;
  }

  return true;
};

export const zFile = () => {
  return z.instanceof(PersistentFile).or(z.instanceof(VolatileFile));
};

export const assertFormidableError = (val: any): val is InstanceType<typeof FormidableError> => {
  if (val instanceof FormidableError) {
    return true;
  }

  return false;
};

export const methods: Method[] = [
  'acl',
  'bind',
  'checkout',
  'connect',
  'copy',
  'delete',
  'get',
  'head',
  'link',
  'lock',
  'm-search',
  'merge',
  'mkactivity',
  'mkcalendar',
  'mkcol',
  'move',
  'notify',
  'options',
  'patch',
  'post',
  'propfind',
  'proppatch',
  'purge',
  'put',
  'rebind',
  'report',
  'search',
  'source',
  'subscribe',
  'trace',
  'unbind',
  'unlink',
  'unlock',
  'unsubscribe',
];
