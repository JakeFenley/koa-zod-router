import { Method, methods, Route, RouterMethods, Spec } from './types';
import KoaRouter, { Middleware } from '@koa/router';
import Router from '@koa/router';
import assert from 'assert';
import outputValidator from './output-validator';
import { flatten } from './util/index';

const router = () => {
  const _routes: Route[] = [];
  const _router = new KoaRouter();

  const middleware = () => {
    return _router.routes();
  };

  const checkValidators = (spec: Spec) => {
    if (!spec.validate) return;

    let text;
    if (spec.validate.body) {
      text = 'validate.type must be declared when using validate.body';
      assert(/json|form/.test(spec.validate.type), text);
    }

    if (spec.validate.type) {
      text = 'validate.type must be either json, form, multipart or stream';
      assert(/json|form|multipart|stream/i.test(spec.validate.type), text);
    }

    if (spec.validate.output) {
      spec.validate.outputValidator = outputValidator(spec.validate.output);
    }

    // default HTTP status code for failures
    if (!spec.validate.failure) {
      spec.validate.failure = 400;
    }
  };

  const _validateRouteSpec = (spec: Spec) => {
    checkHandler(spec);
    checkPreHandler(spec);
    checkMethods(spec);
    checkValidators(spec);
  };

  const _addRoute = (spec: Spec): void => {
    _validateRouteSpec(spec);
    _routes.push(spec);

    // debug('add %s "%s"', spec.method, spec.path);

    const bodyParser = makeBodyParser(spec);
    const specExposer = makeSpecExposer(spec);
    const validator = makeValidator(spec);
    const preHandlers = spec.pre ? flatten(spec.pre) : [];
    const handlers = flatten(spec.handler);

    const args = [spec.path].concat(preHandlers, [prepareRequest, specExposer, bodyParser, validator], handlers);

    spec.method.forEach((method) => {
      // koa types are missing a few type definitions here
      // @ts-ignore
      _router[method].apply(_router, args);
    });
  };

  const route = (spec: Spec): void => {
    if (Array.isArray(spec)) {
      spec.forEach((route) => _addRoute(route));
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
