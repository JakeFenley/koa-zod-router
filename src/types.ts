import Router, { LayerOptions } from '@koa/router';
import { DefaultState, Middleware } from 'koa';
import z, { ZodSchema } from 'zod';
import { ZodContext } from './validator';
import zodRouter from './zod-router';

export type Method =
  | 'acl'
  | 'bind'
  | 'checkout'
  | 'connect'
  | 'copy'
  | 'delete'
  | 'get'
  | 'head'
  | 'link'
  | 'lock'
  | 'm-search'
  | 'merge'
  | 'mkactivity'
  | 'mkcalendar'
  | 'mkcol'
  | 'move'
  | 'notify'
  | 'options'
  | 'patch'
  | 'post'
  | 'propfind'
  | 'proppatch'
  | 'purge'
  | 'put'
  | 'rebind'
  | 'report'
  | 'search'
  | 'source'
  | 'subscribe'
  | 'trace'
  | 'unbind'
  | 'unlink'
  | 'unlock'
  | 'unsubscribe';

export const methods: Method[] = [
  'acl',
  'bind',
  'checkout',
  'connect',
  'copy',
  'delete',
  'get',
  'head',
  'link',
  'lock',
  'm-search',
  'merge',
  'mkactivity',
  'mkcalendar',
  'mkcol',
  'move',
  'notify',
  'options',
  'patch',
  'post',
  'propfind',
  'proppatch',
  'purge',
  'put',
  'rebind',
  'report',
  'search',
  'source',
  'subscribe',
  'trace',
  'unbind',
  'unlink',
  'unlock',
  'unsubscribe',
];

type RequireKeys<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};

export type InferedSchema<T> = z.infer<ZodSchema<T>>;

export type ValidationOptions<ParamsType, QueryType, BodyType, ResponseType> = {
  params?: ZodSchema<ParamsType>;
  query?: ZodSchema<QueryType>;
  body?: ZodSchema<BodyType>;
  response?: ZodSchema<ResponseType>;
};

export type Spec<ParamsType, QueryType, BodyType, ResponseType> = {
  handlers:
    | Middleware<DefaultState, ZodContext<ParamsType, QueryType, BodyType, ResponseType>>
    | Middleware<DefaultState, ZodContext<ParamsType, QueryType, BodyType, ResponseType>>[];
  name?: string;
  path: string;
  pre?: Middleware | Middleware[];
  validate?: ValidationOptions<ParamsType, QueryType, BodyType, ResponseType>;
};

export type RegisterSpec<ParamsType, QueryType, BodyType, ResponseType> = {
  method: Method;
  opts?: LayerOptions;
} & Spec<ParamsType, QueryType, BodyType, ResponseType>;

declare function RouterMethodFn<ParamsType, QueryType, BodyType, ResponseType>(
  path: string,
  handlers: Middleware | Middleware[],
  validationOptions?: ValidationOptions<ParamsType, QueryType, BodyType, ResponseType>,
): Router;
declare function RouterMethodFn<ParamsType, QueryType, BodyType, ResponseType>(
  spec: Spec<ParamsType, QueryType, BodyType, ResponseType>,
): Router;

export type RouterMethod = typeof RouterMethodFn;

export type RouterMethods = {
  [key in Method]: RouterMethod;
};

export type ZodRouter = ReturnType<typeof zodRouter>;
