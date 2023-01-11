import Router, { LayerOptions } from '@koa/router';
import { DefaultState, Middleware } from 'koa';
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

// TODO implement zod types
export type ValidationOptions = {
  body?: Record<string, any>;
  // TODO see if we can get rid of type and auto-detect with zod maybe
  type?: 'json' | 'form' | 'multipart' | 'stream';
  output?: any;
  failure?: number;
};

export type Spec<BodyType> = {
  handlers: Middleware<DefaultState, ZodContext<BodyType>> | Middleware<DefaultState, ZodContext<BodyType>>[];
  name?: string;
  path: string;
  pre?: Middleware | Middleware[];
  validate?: ValidationOptions;
};

export type RegisterSpec<BodyType> = {
  method: Method;
  opts?: LayerOptions;
} & Spec<BodyType>;

declare function RouterMethodFn(
  path: string,
  handlers: Middleware | Middleware[],
  validationOptions?: ValidationOptions,
): Router;
declare function RouterMethodFn<BodyType>(spec: Spec<BodyType>): Router;

export type RouterMethod = typeof RouterMethodFn;

export type RouterMethods = {
  [key in Method]: RouterMethod;
};

export type ZodRouter = ReturnType<typeof zodRouter>;
