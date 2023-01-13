import KoaRouter, { LayerOptions, RouterOptions } from '@koa/router';
import formidable from 'formidable';
import { DefaultState, Middleware } from 'koa';
import bodyParser from 'koa-bodyparser';
import z, { ZodSchema } from 'zod';
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

type RequireKeys<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : T[P] | undefined;
};

export type InferedSchema<T> = z.infer<ZodSchema<T>>;

export interface ZodContext<Headers, Params, Query, Body> {
  request: {
    body: Body;
    headers: Headers;
    params: Params;
    query: Query;
  };
}
export type ValidationOptions<Headers, Params, Query, Body, Response> = {
  headers?: ZodSchema<Headers>;
  params?: ZodSchema<Params>;
  query?: ZodSchema<Query>;
  body?: ZodSchema<Body>;
  response?: ZodSchema<Response>;
};

export type ZodMiddleware<Headers, Params, Query, Body, Response> =
  | Middleware<DefaultState, ZodContext<Headers, Params, Query, Body>, Response>
  | Middleware<DefaultState, ZodContext<Headers, Params, Query, Body>, Response>[];

export type Spec<Headers, Params, Query, Body, Response> = {
  name?: string;
  path: string;
  handlers: ZodMiddleware<Headers, Params, Query, Body, Response>;
  pre?: ZodMiddleware<Headers, Params, Query, Body, Response>;
  validate?: ValidationOptions<Headers, Params, Query, Body, Response>;
};

export type RegisterSpec<Headers, Params, Query, Body, Response> = {
  method: Method;
  opts?: LayerOptions;
} & Spec<Headers, Params, Query, Body, Response>;

declare function RouterMethodFn<Headers, Params, Query, Body, Response>(
  path: string,
  handlers: ZodMiddleware<Headers, Params, Query, Body, Response>,
  validationOptions?: ValidationOptions<Headers, Params, Query, Body, Response>,
): KoaRouter;
declare function RouterMethodFn<Headers, Params, Query, Body, Response>(
  spec: Spec<Headers, Params, Query, Body, Response>,
): KoaRouter;

export type RouterMethod = typeof RouterMethodFn;

export type RouterMethods = {
  [key in Method]: RouterMethod;
};

export type ZodRouter = ReturnType<typeof zodRouter>;

export interface RouterOpts {
  bodyParserOpts?: bodyParser.Options;
  formidableOpts?: formidable.Options;
  koaRouterOpts?: RouterOptions;
  zodRouterOpts?: {
    exposeRequestErrors?: boolean;
    exposeResponseErrors?: boolean;
  };
}
