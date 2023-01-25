import { PersistentFile, VolatileFile, errors } from 'formidable';
import { Context, DefaultState, Middleware, Next } from 'koa';
import { z, ZodTypeAny } from 'zod';
import { Method, RouteSpec, UseSpec, ValidationOptions, ZodContext, ZodMiddleware } from './types';
const { FormidableError } = errors;

export const flatten = <S, H, P, Q, B, F, R>(
  middlewares: Array<ZodMiddleware<S, H, P, Q, B, F, R> | undefined>,
): Middleware<S, ZodContext<H, P, Q, B, F>, R>[] => {
  const flattened = middlewares.reduce((acc: Middleware<S, ZodContext<H, P, Q, B, F>, R>[], curr) => {
    if (!curr) {
      return acc;
    }

    if (Array.isArray(curr)) {
      return acc.concat(flatten(curr));
    }
    return acc.concat(curr);
  }, []);

  return flattened;
};

export const prepareMiddleware = <S, H, P, Q, B, F, R>(
  input: Array<ZodMiddleware<S, H, P, Q, B, F, R> | undefined>,
): Middleware<S, ZodContext<H, P, Q, B, F>, R>[] => {
  return flatten(input);
};

export async function noopMiddleware(ctx: Context, next: Next) {
  return void next();
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

export const assertHandlers = <S, H, P, Q, B, F, R>(val: any): val is ZodMiddleware<S, H, P, Q, B, F, R> => {
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

export const assertUseSpec = <S, H, P, Q, B, F, R>(val: any): val is UseSpec<S, H, P, Q, B, F, R> => {
  if (typeof val === 'object' && val['middleware']) {
    return true;
  }

  return false;
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

export const createRouteSpec = <
  State = DefaultState,
  Headers = ZodTypeAny,
  Params = ZodTypeAny,
  Query = ZodTypeAny,
  Body = ZodTypeAny,
  Files = ZodTypeAny,
  Response = ZodTypeAny,
>(
  spec: RouteSpec<State, Headers, Params, Query, Body, Files, Response>,
): RouteSpec<State, Headers, Params, Query, Body, Files, Response> => {
  return spec;
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
