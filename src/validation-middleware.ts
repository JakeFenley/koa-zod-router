import { DefaultContext, Next } from 'koa';
import { SafeParseReturnType, SafeParseSuccess, ZodError, ZodType, ZodTypeDef } from 'zod';
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
  schema: ZodType<T, ZodTypeDef, T> | undefined,
  data: unknown,
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
  schema: ZodType<T, ZodTypeDef, T> | { [key: string | number]: ZodType<T, ZodTypeDef, T> } | undefined,
  data: unknown,
): Promise<ZodError<T> | undefined> => {
  if (!schema) {
    return undefined;
  }
  // const parsed = await schema.safeParseAsync(data);
  // if (!parsedSuccessful(parsed)) {
  //   return parsed.error;
  // }
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
      validateInput(validation.headers, ctx.request.headers),
      validateInput(validation.params, ctx.request.params),
      validateInput(validation.query, ctx.request.query),
      validateInput(validation.body, ctx.request.body),
    ]).then((inputErrors) => inputErrors.filter((err) => err));

    if (opts?.exposeClientErrors && inputErrors.length) {
      ctx.status = 400;
      ctx.type = 'json';
      ctx.body = { inputErrors };
      ctx.app.emit('error', new ValidationError({ inputErrors }), ctx);
    } else {
      await next();
    }

    const outputErrors = await validateOutput(validation.response, ctx.body);

    if (outputErrors) {
      ctx.throw(500);
    }
  };
};
