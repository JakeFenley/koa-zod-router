import { DefaultContext, Next } from 'koa';
import formidable from 'formidable';

export const multipartParserMiddleware = (options?: formidable.Options) => {
  return async (ctx: DefaultContext, next: Next) => {
    if (!ctx.is('multipart')) {
      return next();
    }

    const form = formidable({ multiples: true, ...options });

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
    next();
  };
};
