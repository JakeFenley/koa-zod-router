import KoaRouter, { LayerOptions, RouterOptions } from '@koa/router';
import formidable, { Files } from 'formidable';
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

export interface ZodContext<Headers, Params, Query, Body, Files> {
  request: {
    body: Body;
    headers: Headers;
    params: Params;
    query: Query;
    files: Files;
  };
}
export type ValidationOptions<Headers, Params, Query, Body, Files, Response> = {
  headers?: ZodSchema<Headers>;
  body?: ZodSchema<Body>;
  params?: ZodSchema<Params>;
  query?: ZodSchema<Query>;
  files?: ZodSchema<Files>;
  response?: ZodSchema<Response>;
};

export type ZodMiddleware<H, P, Q, B, F, R> =
  | Middleware<DefaultState, ZodContext<H, P, Q, B, F>, R>
  | Middleware<DefaultState, ZodContext<H, P, Q, B, F>, R>[];

export type Spec<H, P, Q, B, F, R> = {
  name?: string;
  path: string;
  handlers: ZodMiddleware<H, P, Q, B, F, R>;
  pre?: ZodMiddleware<H, P, Q, B, F, R>;
  validate?: ValidationOptions<H, P, Q, B, F, R>;
};

export type RegisterSpec<H, P, Q, B, F, R> = {
  method: Method | Method[];
  opts?: LayerOptions;
} & Spec<H, P, Q, B, F, R>;

declare function RouterMethodFn<H, P, Q, B, F, R>(
  path: string,
  handlers: ZodMiddleware<H, P, Q, B, F, R>,
  validationOptions?: ValidationOptions<H, P, Q, B, F, R>,
): KoaRouter;
declare function RouterMethodFn<H, P, Q, B, F, R>(spec: Spec<H, P, Q, B, F, R>): KoaRouter;

export type RouterMethod = typeof RouterMethodFn;

export type RouterMethods = {
  [key in Method]: RouterMethod;
};

export type ZodRouter = ReturnType<typeof zodRouter>;

export interface RouterOpts {
  bodyParser?: bodyParser.Options;
  formidable?: formidable.Options;
  koaRouter?: RouterOptions;
  zodRouter?: {
    enableMultipart?: boolean;
    exposeRequestErrors?: boolean;
    exposeResponseErrors?: boolean;
  };
}
