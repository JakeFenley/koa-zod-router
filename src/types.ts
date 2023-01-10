import Router from '@koa/router';
import { Middleware } from 'koa';
import zodRouter from './zod-router';

export type Method = 'delete' | 'get' | 'head' | 'link' | 'options' | 'patch' | 'post' | 'put' | 'unlink';

// TODO implement zod types
export type ValidationOptions = {
  body?: Record<string, any>;
  // TODO see if we can get rid of type and auto-detect with zod maybe
  type?: 'json' | 'form' | 'multipart' | 'stream';
  output?: any;
  failure?: number;
};

export type Spec = {
  handlers: Middleware | Middleware[];
  name?: string;
  path: string;
  pre?: Middleware | Middleware[];
  validate?: ValidationOptions;
};

export type RegisterSpec = {
  method: Method;
} & Spec;

declare function RouterMethodFn(
  path: string,
  handlers: Middleware | Middleware[],
  validationOptions?: ValidationOptions,
): Router;
declare function RouterMethodFn(spec: Spec): Router;

export type RouterMethod = typeof RouterMethodFn;

export type RouterMethods = {
  [key in Method]: RouterMethod;
};

export type ZodRouter = ReturnType<typeof zodRouter>;
