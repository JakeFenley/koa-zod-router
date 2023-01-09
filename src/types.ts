import { Context, Middleware, Next } from 'koa';

export type Method =
  | 'all'
  | 'del'
  | 'delete'
  | 'get'
  | 'head'
  | 'link'
  | 'options'
  | 'patch'
  | 'post'
  | 'put'
  | 'unlink';

export const methods: Method[] = ['all', 'delete', 'get', 'head', 'link', 'options', 'patch', 'post', 'put', 'unlink'];

export type Route = any;
export type RouterMethodFn = (path: string, handlers: Middleware | Middleware[]) => void;
export type RouterMethods = {
  [key in Method]: RouterMethodFn;
};
type Handler = (ctx: Context, next: Next) => void;

export type Spec = {
  path: string;
  handlers: Middleware | Middleware[];
  method: Method;
  pre?: Middleware | Middleware[];
  validate?: {
    body?: Record<string, any>;
    // TODO see if we can get rid of type and auto-detect with zod maybe
    type?: 'json' | 'form' | 'multipart' | 'stream';
    output?: any;
    failure?: number;
  };
};
