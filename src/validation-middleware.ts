import { DefaultContext, Next } from 'koa';
import { SafeParseReturnType, SafeParseSuccess, ZodError, ZodType, ZodTypeAny, ZodTypeDef } from 'zod';
import { ValidationOptions, RouterOpts } from './types';
import { assertValidation, noopMiddleware } from './util';
class ValidationError extends Error {
  constructor(error: {}) {
    super('VALIDATION_ERROR', { cause: error });
  }
}

const parsedSuccessful = <Input, Output>(
  parsed: SafeParseReturnType<Input, Output>,
): parsed is SafeParseSuccess<Output> => {
  return parsed.success;
};

const validate = async <T>(
  data: unknown,
  schema?: ZodTypeAny,
): Promise<ZodError<T> | Record<string, any> | undefined> => {
  if (!schema) {
    return undefined;
  }

  const parsed = await schema.safeParseAsync(data);
  if (!parsedSuccessful(parsed)) {
    return parsed.error;
  }

  return parsed.data;
};

export const validationMiddleware = <H, P, Q, B, R>(
  validation?: ValidationOptions<H, P, Q, B, R>,
  opts?: RouterOpts['zodRouterOpts'],
) => {
  if (!assertValidation(validation)) {
    return noopMiddleware;
  }

  return async (ctx: DefaultContext, next: Next) => {
    // Input validation
    let inputErrors: ZodError[] = [];

    const [headers, params, query, body] = await Promise.all([
      validate(ctx.request.headers, validation.headers),
      validate(ctx.request.params, validation.params),
      validate(ctx.request.query, validation.query),
      validate(ctx.request.body, validation.body),
    ]);

    if (headers) {
      if (headers instanceof ZodError) {
        inputErrors.push(headers);
      } else {
        Object.keys(headers).forEach((header) => {
          ctx.request.headers[header] = headers[header];
        });
      }
    }

    if (params) {
      if (params instanceof ZodError) {
        inputErrors.push(params);
      } else {
        ctx.request.params = params;
      }
    }

    if (query) {
      if (query instanceof ZodError) {
        inputErrors.push(query);
      } else {
        ctx.request.query = query;
      }
    }

    if (body) {
      if (body instanceof ZodError) {
        inputErrors.push(body);
      } else {
        ctx.request.body = body;
      }
    }

    if (inputErrors.length && opts?.exposeRequestErrors) {
      ctx.status = 400;
      ctx.type = 'json';
      ctx.body = { error: inputErrors };
      ctx.app.emit('error', new ValidationError({ inputErrors }), ctx);
      return;
    }

    if (inputErrors.length) {
      ctx.throw(400, 'VALIDATION_ERROR');
    }

    await next();

    // Output validation
    const output = await validate(ctx.body, validation.response);

    if (!output) {
      return;
    }

    if (output instanceof ZodError) {
      if (opts?.exposeResponseErrors) {
        ctx.status = 500;
        ctx.type = 'json';
        ctx.body = { error: output };
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
