import { Context, DefaultContext, Next } from 'koa';
import { SafeParseReturnType, SafeParseSuccess, ZodType, ZodTypeDef } from 'zod';
import { ValidationOptions } from './types';
import { assertValidation, noopMiddleware } from './util/index';

const parsedSuccessful = <Input, Output>(
  parsed: SafeParseReturnType<Input, Output>,
): parsed is SafeParseSuccess<Output> => {
  return parsed.success;
};

const validate = <T>(propName: string, schema: ZodType<T, ZodTypeDef, T> | undefined, data: unknown) => {
  if (!schema) {
    return null;
  }
  const parsed = schema.safeParse(data);
  if (!parsedSuccessful(parsed)) {
    return parsed.error;
  }

  return null;
};

export const validationMiddleware = <Params, Query, Body, Response>(
  validation?: ValidationOptions<Params, Query, Body, Response>,
) => {
  if (!assertValidation(validation)) {
    return noopMiddleware;
  }

  return async (ctx: Context, next: Next) => {
    // validate(validation.params, ctx.request.params);
    // validate(validation.query, ctx.request.query);
    const error = validate('body', validation.body, ctx.request.body);
    // TODO: Add config option for exposing client errors
    if (error) {
      ctx.throw(400, error);
    } else {
      await next();
    }

    // implement output validations here
  };
};
