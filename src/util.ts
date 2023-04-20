import type { default as PersistentFile } from 'formidable/PersistentFile';
import formidable from 'formidable';
import { Context, DefaultState, Middleware, Next } from 'koa';
import { z } from 'zod';
import { Method, RouteSpec, Spec, UseSpec, ValidationOptions, ZodMiddleware } from './types';
const { FormidableError } = formidable.errors;

export const flatten = <S, H, P, Q, B, F, R>(
  middlewares: Array<ZodMiddleware<S, H, P, Q, B, F, R> | undefined>,
): Middleware[] => {
  const flattened = middlewares.reduce((acc: Middleware[], curr) => {
    if (!curr) {
      return acc;
    }

    if (Array.isArray(curr)) {
      return acc.concat(flatten(curr));
    }
    return acc.concat(curr as unknown as Middleware);
  }, []);

  return flattened;
};

export const prepareMiddleware = <S, H, P, Q, B, F, R>(
  input: Array<ZodMiddleware<S, H, P, Q, B, F, R> | undefined>,
): Middleware[] => {
  return flatten(input);
};

export async function noopMiddleware(_ctx: Context, next: Next) {
  await next();
}

export const assertPath = (val: any): val is string | RegExp => {
  if (typeof val === 'string') {
    return true;
  }

  if (val instanceof RegExp) {
    return true;
  }

  return false;
};

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
  if (typeof val === 'object' && val['handler']) {
    return true;
  }

  return false;
};

export const assertRouteFnSpec = <S, H, P, Q, B, F, R>(val: any): val is Spec<S, H, P, Q, B, F, R> => {
  if (typeof val === 'object' && val['handler'] && val['path']) {
    return true;
  }

  return false;
};
export const zFile = (): z.ZodType<PersistentFile, z.ZodTypeDef, PersistentFile> => {
  return z.instanceof(formidable.PersistentFile).or(z.instanceof(formidable.VolatileFile));
};

export const assertFormidableError = (val: any): val is InstanceType<typeof FormidableError> => {
  if (val instanceof FormidableError) {
    return true;
  }

  return false;
};

export const createRouteSpec = <State extends DefaultState, H, P, Q, B, F, R>(
  spec: RouteSpec<State, H, P, Q, B, F, R>,
): RouteSpec<State, H, P, Q, B, F, R> => {
  return spec;
};

export const createUseSpec = <S, H, P, Q, B, F, R>(
  spec: UseSpec<S, H, P, Q, B, F, R>,
): UseSpec<S, H, P, Q, B, F, R> => {
  return spec;
};

export const routerSpecFactory = <State>() => {
  const _createUseSpec = <H, P, Q, B, F, R>(spec: UseSpec<State, H, P, Q, B, F, R>) => {
    return createUseSpec<State, H, P, Q, B, F, R>(spec);
  };
  const _createRouteSpec = <H, P, Q, B, F, R>(spec: RouteSpec<State, H, P, Q, B, F, R>) => {
    return createRouteSpec<State, H, P, Q, B, F, R>(spec);
  };
  return {
    createUseSpec: _createUseSpec,
    createRouteSpec: _createRouteSpec,
  };
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
