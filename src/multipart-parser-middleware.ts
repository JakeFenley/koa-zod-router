import { DefaultContext, Next } from 'koa';
import formidable, { errors } from 'formidable';
import { assertFormidableError } from './util';

export const multipartParserMiddleware = (options?: formidable.Options) => {
  return async (ctx: DefaultContext, next: Next) => {
    if (!ctx.is('multipart')) {
      return next();
    }

    const form = formidable({ multiples: true, ...options });

    try {
      await new Promise<void>((resolve, reject) => {
        form.parse(ctx.req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }

          ctx.request.body = fields;
          ctx.request.files = files;
          resolve();
        });
      });
      await next();
    } catch (err) {
      if (assertFormidableError(err)) {
        if (err.httpCode && err.httpCode >= 400 && err.httpCode < 500) {
          ctx.status = err.httpCode;
          ctx.app.emit('error', err, ctx);
          return;
        } else if (err.httpCode && err.httpCode >= 500) {
          ctx.throw(err.httpCode, err);
        }
      }
      ctx.throw(500, err);
    }
  };
};
