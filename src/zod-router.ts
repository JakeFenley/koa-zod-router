import { Method, methods, Route, RouterMethods, Spec } from './types';
import KoaRouter from '@koa/router';
import { prepareMiddleware, validator } from './util/index';
import koaBody from 'koa-body';

type ZodRouter = ReturnType<typeof zodRouter>;

const zodRouter = (routerOpts?: KoaRouter.RouterOptions) => {
  const _router = new KoaRouter(routerOpts);
  _router.use(koaBody());

  const {
    allowedMethods,
    match,
    methods: koaRouterMethods,
    options,
    opts,
    prefix,
    param,
    params,
    redirect,
    // needs wrapper
    register,
    routes,
    use,
  } = _router;

  const self = {
    ...routerMethods(),
    get router(): KoaRouter {
      return _router;
    },
    allowedMethods,
    match,
    methods: koaRouterMethods,
    middleware,
    options,
    opts,
    param,
    params,
    prefix,
    redirect,
    register,
    route,
    routes,
    use,
  } as const;

  function _addRoute(spec: Spec) {
    _router[spec.method].apply(_router, [
      spec.path,
      ...prepareMiddleware(spec.pre),
      validator(spec),
      ...prepareMiddleware(spec.handlers),
    ]);
  }

  function middleware() {
    return _router.routes();
  }

  function route(spec: Spec): ZodRouter {
    if (Array.isArray(spec)) {
      spec.forEach((route) => {
        return _addRoute(route);
      });
    } else {
      _addRoute(spec);
    }

    return self;
  }

  function routerMethods() {
    return methods.reduce((acc: RouterMethods, method: Method) => {
      acc[method] = function (path: string) {
        let fns;
        let config;

        if (typeof arguments[1] === 'function' || Array.isArray(arguments[1])) {
          config = {};
          fns = Array.prototype.slice.call(arguments, 1);
        } else if (typeof arguments[1] === 'object') {
          config = arguments[1];
          fns = Array.prototype.slice.call(arguments, 2);
        }

        const spec = {
          path: path,
          method: method.toLowerCase(),
          handler: fns,
          ...config,
        };

        _addRoute(spec);

        return self;
      };

      return acc;
    }, {} as RouterMethods);
  }

  return self;
};

export default zodRouter;
