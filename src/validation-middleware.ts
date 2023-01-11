import { DefaultContext, Next } from 'koa';
import { SafeParseReturnType, SafeParseSuccess, ZodError, ZodType, ZodTypeDef } from 'zod';
import { ValidationOptions } from './types';
import { assertValidation, noopMiddleware } from './util/index';

const parsedSuccessful = <Input, Output>(
  parsed: SafeParseReturnType<Input, Output>,
): parsed is SafeParseSuccess<Output> => {
  return parsed.success;
};

const validate = async <T>(
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

class ValidationError extends Error {
  constructor(error: {}) {
    super('VALIDATION_ERROR', { cause: error });
  }
}

export const validationMiddleware = <Headers, Params, Query, Body, Response>(
  validation?: ValidationOptions<Headers, Params, Query, Body, Response>,
) => {
  if (!assertValidation(validation)) {
    return noopMiddleware;
  }

  return async (ctx: DefaultContext, next: Next) => {
    let errors = await Promise.all([
      validate(validation.headers, ctx.request.headers),
      validate(validation.params, ctx.request.params),
      validate(validation.query, ctx.request.query),
      validate(validation.body, ctx.request.body),
    ]).then((errors) => errors.filter((err) => err));
    // TODO: Add config option for exposing client errors##
    if (errors.length) {
      ctx.status = 400;
      ctx.type = 'json';
      ctx.body = { errors };
      ctx.app.emit('error', new ValidationError({ errors }), ctx);
    } else {
      await next();
    }

    // implement output validations here
  };
};
