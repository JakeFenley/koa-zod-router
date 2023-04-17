import { DefaultContext, Next } from 'koa';
import { ZodError, ZodTypeAny } from 'zod';
import { ValidationOptions, RouterOpts } from './types';
import { assertValidation, noopMiddleware } from './util';

class ValidationError extends Error {
  constructor(error: {}) {
    super('VALIDATION_ERROR', { cause: error });
  }
}

const validate = async <T>(
  data: unknown,
  schema: ZodTypeAny | undefined,
  name: string,
): Promise<ZodError<T> | Record<string, any> | undefined> => {
  if (!schema) {
    return undefined;
  }

  const parsed = await schema.safeParseAsync(data);
  if (!parsed.success) {
    parsed.error.name = name;
    return parsed.error;
  }

  return parsed.data;
};

const addParsedProps = (ctxProp: Record<string, any>, parsed?: Record<string, any> | ZodError<unknown>) => {
  if (parsed && !(parsed instanceof ZodError)) {
    Object.entries(parsed).forEach(([k, v]) => {
      ctxProp[k] = v;
    });
  }
};

export const validationMiddleware = <H, P, Q, B, F, R>(
  validation?: ValidationOptions<H, P, Q, B, F, R>,
  opts?: RouterOpts['zodRouter'],
) => {
  if (!assertValidation(validation)) {
    return noopMiddleware;
  }

  return async (ctx: DefaultContext, next: Next) => {
    const validated = await Promise.all([
      validate(ctx.request.headers, validation.headers, 'headers'),
      validate(ctx.request.params, validation.params, 'params'),
      validate(ctx.request.query, validation.query, 'query'),
      validate(ctx.request.body, validation.body, 'body'),
      validate(ctx.request.files, validation.files, 'files'),
    ]);

    const inputErrors = validated.reduce((acc: ZodError[], curr) => {
      if (curr instanceof ZodError) {
        acc.push(curr);
      }
      return acc;
    }, []);

    if (inputErrors.length) {
      const errorObject = inputErrors.reduce((acc: Record<string, any>, curr) => {
        acc[curr.name] = curr.issues;
        return acc;
      }, {});

      if (opts?.continueOnError) {
        ctx.request.validationErrors = errorObject;
      } else if (opts?.exposeRequestErrors) {
        ctx.response.status = 400;
        ctx.type = 'json';
        ctx.body = { error: errorObject };
        ctx.app.emit('error', new ValidationError({ inputErrors }), ctx);
        return;
      } else {
        ctx.throw(400, 'VALIDATION_ERROR');
      }
    }
    const [headers, params, query, body, files] = validated;

    addParsedProps(ctx.request.headers, headers);
    addParsedProps(ctx.request.params, params);
    addParsedProps(ctx.request.query, query);
    addParsedProps(ctx.request.body, body);
    addParsedProps(ctx.request.files, files);

    await next();

    const output = await validate(ctx.body, validation.response, 'response');

    if (!output) {
      return;
    }

    if (output instanceof ZodError) {
      if (opts?.exposeResponseErrors) {
        ctx.status = 500;
        ctx.type = 'json';
        ctx.body = { error: { response: output.issues } };
        ctx.app.emit('error', new ValidationError({ output }), ctx);
        return;
      }

      ctx.throw(500);
    } else {
      ctx.body = output;
      ctx.response.body = output;
    }
  };
};
