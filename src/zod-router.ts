import bodyParser from 'koa-bodyparser';
import KoaRouter, { ParamMiddleware } from '@koa/router';
import {
  Method,
  RegisterSpec,
  Spec,
  ValidationOptions,
  RouterMethods,
  ZodMiddleware,
  RouterOpts,
  RouteSpec,
  UseSpec,
} from './types';
import { assertHandlers, assertPath, assertRouteFnSpec, assertUseSpec, methods, prepareMiddleware } from './util';
import { validationMiddleware } from './validation-middleware';
import { multipartParserMiddleware } from './multipart-parser-middleware';
import { DefaultContext, DefaultState } from 'koa';
import { ZodTypeAny } from 'zod';

const zodRouter = <RouterState = DefaultState>(opts?: RouterOpts) => {
  const _router = new KoaRouter<RouterState>(opts?.koaRouter);
  _router.use(bodyParser(opts?.bodyParser));

  if (opts?.zodRouter?.enableMultipart) {
    _router.use(multipartParserMiddleware(opts?.formidable));
  }

  // Delegated methods - preserves value of 'this' in KoaRouter
  function all() {
    // @ts-ignore
    return _router.all(...arguments);
  }

  function allowedMethods(options?: KoaRouter.RouterAllowedMethodsOptions) {
    return _router.allowedMethods(options);
  }

  function match(path: string, method: string) {
    return _router.match(path, method);
  }

  function middleware() {
    return _router.middleware();
  }

  function param(path: string, middleware: ParamMiddleware) {
    return _router.param(path, middleware);
  }

  function prefix(path: string) {
    return _router.prefix(path);
  }

  function redirect(source: string, destination: string, code?: number) {
    return _router.redirect(source, destination, code);
  }

  function route(name: string) {
    return _router.route(name);
  }

  function routes() {
    return _router.routes();
  }

  function url(name: string, params?: any, options?: KoaRouter.UrlOptionsQuery) {
    return _router.url(name, params, options);
  }

  /**
   * Use given middleware.
   *
   * Middleware run in the order they are defined by `.use()`. They are invoked
   * sequentially, requests start at the first middleware and work their way
   * "down" the middleware stack.
   */
  function use<State = RouterState, Context = DefaultContext>(
    ...middleware: Array<KoaRouter.Middleware<State, Context>>
  ): KoaRouter<State, Context>;
  /**
   * Use given middleware.
   *
   * Middleware run in the order they are defined by `.use()`. They are invoked
   * sequentially, requests start at the first middleware and work their way
   * "down" the middleware stack.
   */
  function use<State = RouterState, Context = DefaultContext>(
    path: string | string[] | RegExp,
    ...middleware: Array<KoaRouter.Middleware<State, Context>>
  ): KoaRouter;

  /**
   * Use given middleware.
   *
   * Middleware run in the order they are defined by `.use()`. They are invoked
   * sequentially, requests start at the first middleware and work their way
   * "down" the middleware stack.
   */
  function use<
    State = RouterState,
    Headers = ZodTypeAny,
    Params = ZodTypeAny,
    Query = ZodTypeAny,
    Body = ZodTypeAny,
    Files = ZodTypeAny,
    Response = ZodTypeAny,
  >(spec: UseSpec<State, Headers, Params, Query, Body, Files, Response>): KoaRouter;

  function use() {
    if (assertUseSpec(arguments[0])) {
      const spec = arguments[0];

      if (assertPath(spec.path)) {
        return _router.use(
          spec.path,
          ...prepareMiddleware([
            spec.pre,
            validationMiddleware(spec.validate, opts?.zodRouter),
            opts?.zodRouter?.validationErrorHandler,
            spec.handler,
          ]),
        );
      } else {
        return _router.use(
          ...prepareMiddleware([
            spec.pre,
            validationMiddleware(spec.validate, opts?.zodRouter),
            opts?.zodRouter?.validationErrorHandler,
            spec.handler,
          ]),
        );
      }
    }

    return _router.use(...arguments);
  }

  /**
   * Create and register a route
   *
   * @example
   *
   * ```javascript
   * router.register({
   *   name: 'post-example',
   *   method: 'post',
   *   path: '/post/:id',
   *   handler:
   *     async (ctx, next) => {
   *       const { foo } = ctx.request.body;
   *       const { bar } = ctx.request.query;
   *       const { id } = ctx.request.params;
   *       ctx.request.headers['x-test-header'];
   *       ctx.body = { hello: 'world' };
   *       await next();
   *     },
   *
   *   validate: {
   *     body: z.object({ foo: z.number() }),
   *     params: z.object({ id: z.coerce.number() }),
   *     query: z.object({ bar: z.string() }),
   *     headers: z.object({ 'x-test-header': z.string() }),
   *     response: z.object({ hello: z.string() }),
   *   },
   * });
   * ```
   */

  function register<H, P, Q, B, F, R>(
    spec: RegisterSpec<RouterState, H, P, Q, B, F, R> | RouteSpec<RouterState, H, P, Q, B, F, R>,
  ) {
    if (!spec.method) {
      throw new Error(`HTTP Method missing in spec ${spec.path}`);
    }

    const methodsParam: string[] = Array.isArray(spec.method) ? spec.method : [spec.method];

    const name = spec.name ? spec.name : null;

    _router.register(
      spec.path,
      methodsParam,
      prepareMiddleware([
        spec.pre,
        validationMiddleware(spec.validate, opts?.zodRouter),
        opts?.zodRouter?.validationErrorHandler,
        spec.handler,
      ]),
      { name },
    );

    return _router;
  }

  const makeRouteMethods = () =>
    methods.reduce((acc: RouterMethods, method: Method) => {
      acc[method] = <H, P, Q, B, F, R>(
        pathOrSpec: string | RegExp | Spec<RouterState, H, P, Q, B, F, R>,
        handler?: ZodMiddleware<RouterState, H, P, Q, B, F, R>,
        validationOptions?: ValidationOptions<H, P, Q, B, F, R>,
      ) => {
        if (assertPath(pathOrSpec) && assertHandlers(handler)) {
          register({
            method,
            path: pathOrSpec,
            handler,
            validate: validationOptions,
          });

          return _router;
        }

        if (assertRouteFnSpec<RouterState, H, P, Q, B, F, R>(pathOrSpec)) {
          register({
            ...pathOrSpec,
            method,
          });

          return _router;
        }

        throw new Error('Invalid route arguments');
      };

      return acc;
    }, {} as RouterMethods);

  return {
    ...makeRouteMethods(),
    register,
    use,
    router: _router,
    opts: _router.opts,
    params: _router.params,
    stack: _router.stack,
    all: all as KoaRouter['all'],
    allowedMethods: allowedMethods as KoaRouter['allowedMethods'],
    match: match as KoaRouter['match'],
    methods: _router.methods as KoaRouter['methods'],
    middleware: middleware as KoaRouter['middleware'],
    param: param as KoaRouter['param'],
    prefix: prefix as KoaRouter['prefix'],
    redirect: redirect as KoaRouter['redirect'],
    route: route as KoaRouter['route'],
    routes: routes as KoaRouter['routes'],
    url: url as KoaRouter['url'],
  } as const;
};

export default zodRouter;
