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

export type ZodMiddleware<H, P, Q, B, R> =
  | Middleware<DefaultState, ZodContext<H, P, Q, B>, R>
  | Middleware<DefaultState, ZodContext<H, P, Q, B>, R>[];

export type Spec<H, P, Q, B, R> = {
  name?: string;
  path: string;
  handlers: ZodMiddleware<H, P, Q, B, R>;
  pre?: ZodMiddleware<H, P, Q, B, R>;
  validate?: ValidationOptions<H, P, Q, B, R>;
};

export type RegisterSpec<H, P, Q, B, R> = {
  method: Method | Method[];
  opts?: LayerOptions;
} & Spec<H, P, Q, B, R>;

declare function RouterMethodFn<H, P, Q, B, R>(
  path: string,
  handlers: ZodMiddleware<H, P, Q, B, R>,
  validationOptions?: ValidationOptions<H, P, Q, B, R>,
): KoaRouter;
declare function RouterMethodFn<H, P, Q, B, R>(spec: Spec<H, P, Q, B, R>): KoaRouter;

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
