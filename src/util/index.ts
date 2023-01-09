import { Spec } from 'src/types';
import busboy from 'busboy';
import { Context } from 'koa';
import { RouterContext } from '@koa/router';

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

function makeMultipartParser(spec: Spec) {
  const opts = spec.validate.multipartOptions || {};
  if (typeof opts.autoFields === 'undefined') {
    opts.autoFields = true;
  }
  return async function parseMultipart(ctx: RouterContext) {
    if (!ctx.request.is('multipart/*')) {
      return ctx.throw(400, 'expected multipart');
    }
    ctx.request.parts = busboy(ctx, opts);
  };
}
