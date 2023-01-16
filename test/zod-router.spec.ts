import assert from 'assert';
import { describe, it } from 'node:test';
import { methods } from '../src/util';
import KoaRouter from '@koa/router';
import zodRouter from '../src/zod-router';
import { createApp, request } from './test-utils';
import { z } from 'zod';

describe('zodRouter', () => {
  describe('wrapped methods', () => {
    it('should have functions for all http methods', () => {
      const router = zodRouter();

      for (const method of methods) {
        assert(typeof router[method] === 'function');
      }
    });

    it('register method should create a route with provided values and contain 3 middlewares', () => {
      const router = zodRouter({ koaRouter: { prefix: '/test' } });
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

    it('register allows for multiple methods', async () => {
      const router = zodRouter();

      router.register({
        path: '/',
        method: ['patch', 'post'],
        handlers: (ctx) => {
          const { test } = ctx.request.body;
          ctx.body = { success: Boolean(test) };
        },
        validate: {
          body: z.object({ test: z.string() }),
          response: z.object({ success: z.boolean() }),
        },
      });

      const app = createApp(router);

      await request(app)
        .patch('/')
        .send({ test: 'hello' })
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.success === true);
        });

      await request(app)
        .post('/')
        .send({ test: 'hello' })
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.success === true);
        });
    });

    it('http method functions work with path or route spec as first arg', async () => {
      const router = zodRouter();

      router.get('/path', (ctx) => {
        ctx.body = { success: true };
      });

      router.get({
        path: '/spec',
        handlers: (ctx) => {
          ctx.body = { success: true };
        },
      });

      const app = createApp(router);

      await request(app)
        .get('/path')
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.success === true);
        });

      await request(app)
        .get('/spec')
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.success === true);
        });
    });
  });

  describe('delegated methods', () => {
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
      router.prefix('/test-prefix');

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

  describe('zod validation middleware', () => {
    it('should strip invalid fields from output', async () => {
      const router = zodRouter();
      const validation = z.object({ hello: z.string() }).or(z.object({ second: z.string() }));

      router.get(
        '/',
        (ctx) => {
          // @ts-ignore - purposefully ignore bad type
          ctx.body = { hello: 'world', invalid: 'should get stripped', second: 'should get stripped' };
        },
        {
          response: validation,
        },
      );

      router.get(
        '/second',
        (ctx) => {
          // @ts-ignore - purposefully ignore bad type
          ctx.body = { invalid: 'should get stripped', second: 'should be here' };
        },
        {
          response: validation,
        },
      );

      const app = createApp(router);
      await request(app)
        .get('/')
        .then((response) => {
          assert.equal(response.body.second, undefined);
          assert.equal(response.body.invalid, undefined);
          assert.equal(response.body.hello, 'world');
        });

      await request(app)
        .get('/second')
        .then((response) => {
          assert.equal(response.body.second, 'should be here');
          assert.equal(response.body.invalid, undefined);
        });
    });

    it('query params are validated', async () => {
      const router = zodRouter();

      router.get({
        path: '/',
        handlers: (ctx) => {
          ctx.body = { test: ctx.request.query.test };
        },
        validate: {
          query: z.object({ test: z.string() }),
        },
      });

      const app = createApp(router);

      await request(app)
        .get('/?test=hello')
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.test === 'hello');
        });

      await request(app)
        .get('/')
        .then((res) => {
          assert(res.status === 400);
          assert(res.body.success === undefined);
        });
    });

    it('request body is validated', async () => {
      const router = zodRouter();

      router.register({
        method: 'post',
        path: '/',
        handlers: (ctx) => {
          ctx.body = { test: ctx.request.body.test };
        },
        validate: {
          body: z.object({
            test: z.string(),
          }),
        },
      });

      const app = createApp(router);

      await request(app)
        .post('/')
        .send({ test: 'hello' })
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.test === 'hello');
        });

      await request(app)
        .post('/')
        .then((res) => {
          assert(res.status === 400);
          assert(res.body.success === undefined);
        });
    });

    it('path params are validated', async () => {
      const router = zodRouter();

      router.register({
        method: 'get',
        path: '/test/:id/:sku',
        handlers: (ctx) => {
          ctx.body = { id: ctx.request.params.id, sku: ctx.request.params.sku };
        },
        validate: {
          params: z.object({
            id: z.coerce.number(),
            sku: z.string(),
          }),
        },
      });

      const app = createApp(router);

      await request(app)
        .get('/test/1/hello')
        .then((res) => {
          assert(res.status === 200);
          assert(res.body.id === 1 && res.body.sku === 'hello');
        });

      await request(app)
        .get('/test/ffff/hello')
        .then((res) => {
          assert(res.status === 400);
          assert(res.body.success === undefined);
        });
    });

    it('headers are validated', async () => {
      const router = zodRouter();

      router.register({
        method: 'patch',
        path: '/',
        handlers: (ctx) => {
          ctx.body = { test: ctx.request.headers.test };
        },
        validate: {
          headers: z.object({
            test: z.string(),
          }),
        },
      });

      const app = createApp(router);

      await request(app)
        .patch('/')
        .set('test', 'hello')
        .then((res) => {
          assert(res.body.test === 'hello');
        });

      await request(app)
        .patch('/')
        .then((res) => {
          assert(res.body.test === undefined);
          assert(res.status === 400);
        });
    });
  });

  describe('option', () => {
    it('exposeResponseErrors: true - should send response validation errors in response body', async () => {
      const router = zodRouter({ zodRouter: { exposeResponseErrors: true } });

      router.post('/', (ctx, next) => {}, { response: z.object({ test: z.boolean() }) });

      const app = createApp(router);

      const res = await request(app).post('/');

      assert(res.body?.error?.issues.length === 1);
      assert(res.status === 500);
    });

    it('exposeResponseErrors: false - should not send response validation errors in response body', async () => {
      const router = zodRouter({ zodRouter: { exposeResponseErrors: false } });

      router.patch('/', [(ctx, next) => {}], { response: z.object({ test: z.boolean() }) });

      const app = createApp(router);

      const res = await request(app).patch('/');

      assert(res.body?.error?.issues === undefined);
      assert(res.status === 500);
    });

    it('exposeRequestErrors: true - should send request validation errors in response body', async () => {
      const router = zodRouter({ zodRouter: { exposeRequestErrors: true } });

      router.delete('/', (ctx, next) => {}, {
        query: z.object({ test: z.string() }),
        body: z.object({ hello: z.string() }),
        headers: z.object({ 'x-test-header': z.string() }),
      });

      const app = createApp(router);

      const res = await request(app).delete('/');

      assert(res.body?.error?.length === 3);
      assert(res.status === 400);
    });

    it('exposeRequestErrors: false - should not send request validation errors in response body', async () => {
      const router = zodRouter({ zodRouter: { exposeRequestErrors: false } });

      router.put('/', (ctx, next) => {}, { query: z.object({ test: z.string() }) });

      const app = createApp(router);

      const res = await request(app).put('/');

      assert(res.body?.error?.issues === undefined);
      assert(res.status === 400);
    });
  });

  describe('multipart', () => {
    it('should be able to receive multiple values for fields and files', async () => {
      const router = zodRouter({
        formidable: {
          uploadDir: '/tmp',
        },
        zodRouter: { enableMultipart: true },
      });

      router.register({
        path: '/test',
        method: 'put',
        handlers: (ctx) => {
          ctx.status = 201;
          // @ts-ignore
          const { test_file } = ctx.request.files;

          ctx.body = {
            // @ts-ignore
            hello: ctx.request.body.hello.join(''),
            file_one: test_file[0],
            file_two: test_file[1],
          };
        },
      });

      const app = createApp(router);

      await request(app)
        .put('/test')
        .type('multipart/form-data')
        .field('hello', 'foo')
        .field('hello', 'bar')
        .attach('test_file', 'package.json')
        .attach('test_file', 'tsconfig.json')
        .then((res) => {
          assert(res.status === 201);
          assert(res.body.hello === 'foobar');
          assert(res.body.file_one.originalFilename === 'package.json');
          assert(res.body.file_two.originalFilename === 'tsconfig.json');
        });
    });
  });
});
