import assert from 'assert';
import { describe, it } from 'node:test';
import { methods } from '../src/util';
import KoaRouter from '@koa/router';
import zodRouter from '../src/zod-router';

describe('zodRouter', () => {
  // Unit tests
  it('should have functions for all http methods', () => {
    const router = zodRouter();

    for (const method of methods) {
      assert(typeof router[method] === 'function');
    }
  });

  it('register method should create a route with provided values and contain 3 middlewares', () => {
    const router = zodRouter({ koaRouterOpts: { prefix: '/test' } });
    router.register({
      name: 'post-example',
      method: 'post',
      path: '/post',
      pre: async (ctx, next) => {
        await next();
      },
      handlers: [
        async (ctx, next) => {
          next();
        },
      ],
    });

    const route = router.route('post-example') as KoaRouter.Layer;

    assert(route?.stack.length === 3);
    assert(route?.methods[0] === 'POST');
    assert(route?.opts.prefix === '/test');
    assert(route?.name === 'post-example');
  });

  // Integration tests
  it('all should use koa-router implementation', () => {
    const router = zodRouter();

    router.all('example', '/test', () => {});

    const route = router.route('example') as KoaRouter.Layer;
    assert(route?.methods.length > 1);
  });

  it('allowedMethods should use koa-router implementation', () => {
    const router = zodRouter();
    assert(typeof router.allowedMethods() === 'function');
  });

  it('match should use koa-router implementation', () => {
    const router = zodRouter();

    router.register({
      method: 'get',
      path: '/test',
      name: 'example',
      handlers: () => {},
    });

    assert(router.match('/test', 'get')?.path.find((route) => route.name === 'example'));
  });

  it('middleware should use koa-router implementation', () => {
    const router = zodRouter();
    assert(typeof router.middleware() === 'function');
  });

  it('param should use koa-router implementation and router instance should match', () => {
    const router = zodRouter();
    assert.equal(
      router.param('/test', () => {}),
      router.router,
    );
  });

  it('prefix should use koa-router implementation', () => {
    const router = zodRouter();
    router.prefix('test-prefix');

    router.register({
      method: 'get',
      path: '/test',
      name: 'example',
      handlers: () => {},
    });

    const route = router.route('example') as KoaRouter.Layer;
    assert(route?.opts.prefix === '/test-prefix');
  });
});
