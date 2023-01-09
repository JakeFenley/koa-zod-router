import { Context, Next } from 'koa';
import { cloneDeep } from 'lodash';
import { Spec } from 'src/types';

function recursiveFlatten(array: Array<any>): Array<any> {
  return array.reduce((acc, curr) => {
    if (Array.isArray(curr)) {
      return acc.concat(recursiveFlatten(curr));
    }
    return acc.concat(curr);
  }, []);
}

export const flatten = <T>(input: Array<any> | T): Array<any> | T => {
  if (!Array.isArray(input)) {
    return input;
  } else {
    return recursiveFlatten(input);
  }
};

export async function noopMiddleware(ctx: Context, next: Next) {
  return await next();
}

export const specExposer = (spec: Spec) => {
  const specCopy = cloneDeep(spec);
  return async (ctx: Context, next: Next) => {
    ctx.state.route = specCopy;
    await next();
  };
};

const validator = (spec: Spec) => {
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
