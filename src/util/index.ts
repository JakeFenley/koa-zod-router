import { Context, DefaultState, Middleware, Next } from 'koa';
import { RegisterSpec, Spec, ValidationOptions, ZodContext } from 'src/types';

function flatten(array: Array<any>): Array<any> {
  return array.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc.concat(flatten(curr));
    }
    return acc.concat(curr);
  }, []);
}

export const prepareMiddleware = <ParamsType, QueryType, BodyType, ResponseType>(
  input?:
    | Middleware<DefaultState, ZodContext<ParamsType, QueryType, BodyType, ResponseType>>
    | Middleware<DefaultState, ZodContext<ParamsType, QueryType, BodyType, ResponseType>>[],
): Middleware<DefaultState, ZodContext<ParamsType, QueryType, BodyType, ResponseType>>[] => {
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

export const assertSpec = <ParamsType, QueryType, BodyType, ResponseType>(
  val: any,
): val is
  | Spec<ParamsType, QueryType, BodyType, ResponseType>
  | RegisterSpec<ParamsType, QueryType, BodyType, ResponseType> => {
  if (typeof val === 'object' && val['path']) {
    return true;
  }

  return false;
};

export const assertValidation = <ParamsType, QueryType, BodyType, ResponseType>(
  val: any,
): val is ValidationOptions<ParamsType, QueryType, BodyType, ResponseType> => {
  // TODO check these later
  const props = ['body', 'query', 'output', 'failure', 'type'];

  if (typeof val === 'object') {
    for (const prop of props) {
      if (val[prop]) {
        return true;
      }
    }
  }

  return false;
};
