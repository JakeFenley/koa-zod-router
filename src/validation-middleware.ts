import { DefaultContext, Next } from 'koa';
import { SafeParseReturnType, SafeParseSuccess, ZodError, ZodObject, ZodType, ZodTypeDef } from 'zod';
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
  ctx: DefaultContext,
  schema?: ZodType<T, ZodTypeDef, T> | { [key: string | number]: ZodType<T, ZodTypeDef, T> },
): Promise<ZodError<T>[] | undefined> => {
  if (!schema) {
    return undefined;
  }

  if (schema instanceof ZodObject) {
    const parsed = await schema.safeParseAsync(ctx.body);
    if (!parsedSuccessful(parsed)) {
      return [parsed.error];
    }
  }

  return undefined;
};

export const validationMiddleware = <Headers, Params, Query, Body, Response>(
  validation?: ValidationOptions<Headers, Params, Query, Body, Response>,
  opts?: RouterOpts['zodRouterOpts'],
) => {
  if (!assertValidation(validation)) {
    return noopMiddleware;
  }

  return async (ctx: DefaultContext, next: Next) => {
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

    const outputErrors = await validateOutput(ctx, validation.response);

    if (outputErrors?.length && opts?.exposeRequestErrors) {
      ctx.status = 500;
      ctx.type = 'json';
      ctx.body = { outputErrors };
      ctx.app.emit('error', new ValidationError({ outputErrors }), ctx);
      return;
    }

    if (outputErrors?.length) {
      ctx.throw(500);
    }
  };
};
