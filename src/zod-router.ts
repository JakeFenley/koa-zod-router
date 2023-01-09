import KoaRouter from '@koa/router';
import assert from 'assert';

type Method =
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

const methods: Method[] = [
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

type Route = any;
type RouterMethodFn = (path: string) => void;
type RouterMethods = {
  [key in Method]: RouterMethodFn;
};

type Spec = {
  path: string;
  method: Method[];
  validate: {
    body: Record<string, any>;
    type: string;
    output: any;
    failure: number;
  };
};

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
      // TODO ADDD
      // spec.validate._outputValidator = new OutputValidator(spec.validate.output);
    }

    // default HTTP status code for failures
    if (!spec.validate.failure) {
      spec.validate.failure = 400;
    }
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
      // @koa/router uses any[] for method types here
      // @ts-ignore
      _router[method].apply(_router, args);
    });
  };

  const route = (spec: Spec): void => {
    if (Array.isArray(spec)) {
      for (let i = 0; i < spec.length; i++) {
        _addRoute(spec[i]);
      }
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

  return Object.assign(routerMethods, {
    route,
    middleware,
    get routes(): Route[] {
      return _routes;
    },
  });
};

const newRouter = router();

export default router;
