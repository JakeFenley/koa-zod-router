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

const validateInput = async <T>(
  data: unknown,
  schema?: ZodType<T, ZodTypeDef, T>,
): Promise<ZodError<T> | undefined> => {
  if (!schema) {
    return undefined;
  }
  const parsed = await schema.safeParseAsync(data);
  if (!parsedSuccessful(parsed)) {
    return parsed.error;
  }

  return undefined;
};

const validateOutput = async <T>(
  data: unknown,
  schema?: ZodTypeAny,
  opts?: RouterOpts['zodRouterOpts'],
): Promise<ZodError<T> | SafeParseSuccess<ZodTypeAny> | undefined> => {
  if (!schema) {
    return undefined;
  }

  const parsed = await schema.safeParseAsync(data);
  if (!parsedSuccessful(parsed)) {
    return parsed.error;
  }
  return parsed;
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
    const inputErrors = await Promise.all([
      validateInput(ctx.request.headers, validation.headers),
      validateInput(ctx.request.params, validation.params),
      validateInput(ctx.request.query, validation.query),
      validateInput(ctx.request.body, validation.body),
    ]).then((inputErrors) => inputErrors.filter((err) => err));

    if (inputErrors.length && opts?.exposeRequestErrors) {
      ctx.status = 400;
      ctx.type = 'json';
      ctx.body = { inputErrors };
      ctx.app.emit('error', new ValidationError({ inputErrors }), ctx);
      return;
    }

    if (inputErrors.length) {
      ctx.throw(400, 'VALIDATION_ERROR');
    }

    await next();

    // Output validation
    const output = await validateOutput(ctx.body, validation.response, opts);

    if (!output) {
      return;
    }

    if (output instanceof ZodError) {
      if (opts?.exposeResponseErrors) {
        ctx.status = 500;
        ctx.type = 'json';
        ctx.body = { output };
        ctx.app.emit('error', new ValidationError({ output }), ctx);
        return;
      }

      ctx.throw(500);
    } else {
      ctx.body = output.data;
      ctx.response.body = output.data;
    }
  };
};
