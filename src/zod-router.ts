import { Method, methods, Route, RouterMethods, Spec } from './types';
import KoaRouter, { Middleware } from '@koa/router';
import Router from '@koa/router';
import { flatten, specExposer } from './util/index';
import koaBody from 'koa-body';

const router = () => {
  const _routes: Route[] = [];
  const _router = new KoaRouter();
  _router.use(koaBody());

  const middleware = () => {
    return _router.routes();
  };

  const _addRoute = (spec: Spec): void => {
    _routes.push(spec);

    // debug('add %s "%s"', spec.method, spec.path);

    const preHandlers = spec.pre ? flatten(spec.pre) : [];
    const handlers = flatten(spec.handler);

    // koa types are missing a few type definitions here
    // @ts-ignore
    _router[spec.method].apply(_router, spec.path, preHandlers, specExposer(spec), validator(spec), handlers);
  };

  const route = (spec: Spec): void => {
    if (Array.isArray(spec)) {
      spec.forEach((route) => {
        return _addRoute(route);
      });
    } else {
      _addRoute(spec);
    }

    return;
  };

  const routerMethods = methods.reduce((acc: RouterMethods, method: Method) => {
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

      route(spec);

      return;
    };

    return acc;
  }, {} as RouterMethods);

  const prefix = (prefixPath: string) => {
    return _router.prefix(prefixPath);
  };

  const use = (middleware: Middleware) => {
    return _router.use(middleware);
  };

  const param = (param: string, middleware: Router.ParamMiddleware): Router => {
    return _router.param(param, middleware);
  };

  return Object.assign(routerMethods, {
    get routes(): Route[] {
      return _routes;
    },
    get router(): KoaRouter {
      return _router;
    },
    middleware,
    param,
    prefix,
    route,
    use,
  });
};

const newRouter = router();

export default router;
