import { Method, methods, RouterMethods, Spec } from './types';
import KoaRouter from '@koa/router';
import { prepareMiddleware, validationMiddleware } from './util/index';
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
    route,
    routes,
    use,
  } = _router;

  const self = {
    ...makeRouteMethods(),
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

  function middleware() {
    return _router.routes();
  }

  function register(spec: Spec): ZodRouter {
    const methodsParam: string[] = Array.isArray(spec.method) ? spec.method : [spec.method];

    _router.register(spec.path, methodsParam, [
      ...prepareMiddleware(spec.pre),
      validationMiddleware(spec),
      ...prepareMiddleware(spec.handlers),
    ]);

    return self;
  }

  function makeRouteMethods() {
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

        // TODO add prehandlers
        const spec = {
          path,
          method,
          handler: fns,
          ...config,
        };

        register(spec);

        return self;
      };

      return acc;
    }, {} as RouterMethods);
  }

  return self;
};

export default zodRouter;
