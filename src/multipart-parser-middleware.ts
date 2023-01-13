import { DefaultContext, Next } from 'koa';
import formidable from 'formidable';

export const multipartParserMiddleware = (options?: formidable.Options) => {
  return async (ctx: DefaultContext, next: Next) => {
    if (!ctx.is('multipart')) {
      return next();
    }

    const form = formidable({ multiples: true, ...options });
    form.parse(ctx.req, (error, fields, files) => {
      if (error) {
        ctx.throw(500);
      }

      ctx.request.body = fields;
      ctx.request.files = files;

      next();
    });
  };
};
