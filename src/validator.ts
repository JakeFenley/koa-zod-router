import { Context, Next } from 'koa';
import { ValidationOptions } from './types';
import { noopMiddleware } from './util/index';

export const validationMiddleware = <ParamsType, QueryType, BodyType, ResponseType>(
  validation?: ValidationOptions<ParamsType, QueryType, BodyType, ResponseType>,
) => {
  if (!validation) {
    return noopMiddleware;
  }

  const props = ['header', 'query', 'params', 'body'];

  return async (ctx: Context, next: Next) => {
    console.log('validator middleware');

    // implement input validations here

    await next();

    // implement output validations here
  };
};
