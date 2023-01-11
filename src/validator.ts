import {
  BaseContext,
  BaseRequest,
  Context,
  DefaultContext,
  DefaultState,
  ExtendableContext,
  Next,
  ParameterizedContext,
  Request,
} from 'koa';
import { SafeParseReturnType, SafeParseSuccess, ZodSchema, ZodType, ZodTypeDef, z } from 'zod';
import type { Files } from 'formidable';

type RequireKeys<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};

export type InferedSchema<T> = z.infer<ZodSchema<T>>;

export type Schema<ParamsType, QueryType, BodyType, ResponseType> = {
  params?: ZodSchema<ParamsType>;
  query?: ZodSchema<QueryType>;
  body?: ZodSchema<BodyType>;
  response?: ZodSchema<ResponseType>;
};

// req: Request<RequireKeys<InferedSchema<ParamsType>>, any, InferedSchema<BodyType>, InferedSchema<QueryType>>,
// res: Response<RequireKeys<InferedSchema<ResponseType>>>,

export interface ParameterizedRequest<BodyType> extends BaseRequest {
  body?: BodyType;
}

export interface ZodContext<BodyType> extends BaseContext {
  request: {
    body?: BodyType;
  } & BaseRequest;
}

// const ob: ZodContext<{ foo: 'bar' }> = {
//   request: {
//     body: { foo: 'bar' },
//   },
// };

export type ZodTypeSafeHandler<ParamsType, QueryType, BodyType, ResponseType> = (
  ctx: ParameterizedContext<DefaultState, ParameterizedRequest<BodyType>>,
  next: Next,
) => void;

// type ZodTypedResponse<T> = Response & { send: (body: T) => void };
