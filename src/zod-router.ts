import { Method, RegisterSpec, Spec, ValidationOptions, RouterMethod } from './types';
import KoaRouter, { ParamMiddleware } from '@koa/router';
import { prepareMiddleware, validationMiddleware } from './util/index';
import koaBody from 'koa-body';
import { Middleware } from 'koa';
import Router from '@koa/router';

const zodRouter = (routerOpts?: KoaRouter.RouterOptions) => {
  const _router = new KoaRouter(routerOpts);
  _router.use(koaBody());

  // Delegated methods - preserves value of 'this' in KoaRouter
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

  function use(...args: any[]) {
    return _router.use(args);
  }

  function url(name: string, params?: any, options?: KoaRouter.UrlOptionsQuery) {
    return _router.url(name, params, options);
  }

  /**
   * Register route with all methods.
   */
  function all(spec: Spec) {
    const middlewares = [
      ...prepareMiddleware(spec.pre),
      validationMiddleware(spec.validate),
      ...prepareMiddleware(spec.handlers),
      // Type assertion as @types/koa__router doesn't annotate the middlewares param to allow for middleware arrays (they are supported by the lib)
    ] as unknown as Middleware;

    if (spec.name) {
      _router.all(spec.path, spec.name, middlewares);
    } else {
      _router.all(spec.path, middlewares);
    }

    return _router;
  }

  /**
   * Create and register a route.
   *
   * Example:
   *  register({
   *  path: '/users',
   *  method: 'post',
   *  handlers: async (ctx, next) => {
   *    ctx.body = { success: true };
   *    await next();
   *  },
   *  validate: {
   *    body: z.object({ email: z.string() }),
   *    output: z.object({ success: z.boolean() }),
   *  },
   * });
   */

  function register(spec: RegisterSpec) {
    const methodsParam: string[] = Array.isArray(spec.method) ? spec.method : [spec.method];

    const name = spec.name ? spec.name : null;

    _router.register(
      spec.path,
      methodsParam,
      [...prepareMiddleware(spec.pre), validationMiddleware(spec.validate), ...prepareMiddleware(spec.handlers)],
      { name },
    );

    return _router;
  }

  function _httpMethodFactory(method: Method): RouterMethod {
    return (pathOrSpec: string | Spec, handlers?: Middleware | Middleware[], validationOptions?: ValidationOptions) => {
      if (typeof pathOrSpec === 'string' && handlers) {
        register({
          method,
          path: pathOrSpec,
          handlers,
          validate: validationOptions,
        });

        return _router;
      }

      if (typeof pathOrSpec === 'object') {
        register({
          ...pathOrSpec,
          method,
        });

        return _router;
      }

      throw new Error('Invalid route arguments');
    };
  }

  /**
   * HTTP Get Method
   */
  const get = _httpMethodFactory('get');

  /**
   * HTTP Delete Method
   */
  const deleteMethod = _httpMethodFactory('delete');

  /**
   * HTTP Head Method
   */
  const head = _httpMethodFactory('head');

  /**
   * HTTP Link Method
   */
  const link = _httpMethodFactory('link');

  /**
   * HTTP Options Method
   */
  const options = _httpMethodFactory('options');

  /**
   * HTTP Patch Method
   */
  const patch = _httpMethodFactory('patch');

  /**
   * HTTP Post Method
   */
  const post = _httpMethodFactory('post');

  /**
   * HTTP Put Method
   */
  const put = _httpMethodFactory('put');

  /**
   * HTTP Unlink Method
   */
  const unlink = _httpMethodFactory('unlink');

  return {
    get router() {
      return _router;
    },
    all,
    get,
    delete: deleteMethod,
    head,
    link,
    options,
    patch,
    post,
    put,
    register,
    unlink,
    // Delegated methods - we preserve KoaRouter type definitions with assertions
    allowedMethods: allowedMethods as Router['allowedMethods'],
    match: match as Router['match'],
    methods: _router.methods,
    middleware: middleware as Router['middleware'],
    opts: _router.opts,
    param: param as Router['param'],
    params: _router.params,
    prefix: prefix as Router['prefix'],
    redirect: redirect as Router['redirect'],
    route: route as Router['route'],
    routes: routes as Router['routes'],
    stack: _router.stack,
    use: use as Router['use'],
    url: url as Router['url'],
  } as const;
};

export default zodRouter;
