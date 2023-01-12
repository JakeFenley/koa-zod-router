import { Context, DefaultState, Middleware, Next } from 'koa';
import { RegisterSpec, Spec, ValidationOptions, ZodContext, ZodMiddleware } from './types';

function flatten(array: Array<any>): Array<any> {
  return array.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc.concat(flatten(curr));
    }
    return acc.concat(curr);
  }, []);
}

export const prepareMiddleware = <Headers, Params, Query, Body, Response>(
  input?: ZodMiddleware<Headers, Params, Query, Body, Response>,
): Middleware<DefaultState, ZodContext<Headers, Params, Query, Body>, Response>[] => {
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

export const assertSpec = <Headers, Params, Query, Body, Response>(
  val: any,
): val is Spec<Headers, Params, Query, Body, Response> | RegisterSpec<Headers, Params, Query, Body, Response> => {
  if (typeof val === 'object' && val['path']) {
    return true;
  }

  return false;
};

export const assertValidation = <Headers, Params, Query, Body, Response>(
  val: any,
): val is ValidationOptions<Headers, Params, Query, Body, Response> => {
  const props = ['body', 'query', 'params', 'response'];

  if (typeof val === 'object') {
    for (const prop of props) {
      if (val[prop]) {
        return true;
      }
    }
  }

  return false;
};
