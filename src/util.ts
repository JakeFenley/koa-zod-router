import { Context, DefaultState, Middleware, Next } from 'koa';
import { Method, ValidationOptions, ZodContext, ZodMiddleware } from './types';

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
