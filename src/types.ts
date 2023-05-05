import KoaRouter, { LayerOptions, RouterOptions } from '@koa/router';
import formidable from 'formidable';
import { Context, Middleware, Request, Response } from 'koa';
import bodyParser from 'koa-bodyparser';
import z, { ZodError, ZodSchema } from 'zod';
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

export interface ZodRouterInvalid {
  body?: ZodError[];
  headers?: ZodError[];
  params?: ZodError[];
  query?: ZodError[];
  files?: ZodError[];
  error?: boolean;
}

export type ZodValidationError<T> = {
  requestParameter: 'body' | 'headers' | 'params' | 'query' | 'files';
  error: ZodError<T>[];
};

export interface ZodContext<Headers, Params, Query, Body, Files> extends Context {
  request: {
    body: Body;
    headers: Headers;
    params: Params;
    query: Query;
    files: Files;
  } & Request;
  invalid: ZodRouterInvalid;
}

export type ValidationOptions<Headers, Params, Query, Body, Files, Response> = {
  continueOnError?: boolean;
  headers?: ZodSchema<Headers, z.ZodTypeDef, any>;
  body?: ZodSchema<Body, z.ZodTypeDef, any>;
  params?: ZodSchema<Params, z.ZodTypeDef, any>;
  query?: ZodSchema<Query, z.ZodTypeDef, any>;
  files?: ZodSchema<Files, z.ZodTypeDef, any>;
  response?: ZodSchema<Response, z.ZodTypeDef, any>;
};

export type ZodMiddleware<S, H, P, Q, B, F, R = Response['ctx']> =
  | Middleware<S, ZodContext<H, P, Q, B, F>, R>
  | Middleware<S, ZodContext<H, P, Q, B, F>, R>[];

export type Spec<S, H, P, Q, B, F, R> = {
  name?: string;
  path: string | RegExp;
  handler: ZodMiddleware<S, H, P, Q, B, F, R>;
  pre?: ZodMiddleware<S, H, P, Q, B, F, R>;
  validate?: ValidationOptions<H, P, Q, B, F, R>;
  opts?: LayerOptions;
};

export type RegisterSpec<S, H, P, Q, B, F, R> = {
  method: Method | Method[];
} & Spec<S, H, P, Q, B, F, R>;

export type RouteSpec<S, H, P, Q, B, F, R> = {
  method?: Method | Method[];
} & Spec<S, H, P, Q, B, F, R>;

export type UseSpec<S, H, P, Q, B, F, R> = {
  handler: ZodMiddleware<S, H, P, Q, B, F, R>;
  path?: string;
  pre?: ZodMiddleware<S, H, P, Q, B, F, R>;
  validate?: ValidationOptions<H, P, Q, B, F, R>;
};

declare function RouterMethodFn<S, H, P, Q, B, F, R>(
  path: string | RegExp,
  handler: ZodMiddleware<S, H, P, Q, B, F, R>,
  validationOptions?: ValidationOptions<H, P, Q, B, F, R>,
): KoaRouter;

declare function RouterMethodFn<S, H, P, Q, B, F, R>(spec: Spec<S, H, P, Q, B, F, R>): KoaRouter;

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
