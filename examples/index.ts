import Koa from 'koa';
import { zFile } from '../src/util';
import { z } from 'zod';
import zodRouter from '../src/zod-router';

const app = new Koa();

const router = zodRouter({
  zodRouter: { exposeRequestErrors: true, exposeResponseErrors: true, enableMultipart: true },
});

router.post(
  '/hello/:id',
  async (ctx, next) => {
    const { foo } = ctx.request.body;
    const { bar } = ctx.request.query;
    const { id } = ctx.request.params;
    ctx.request.headers['x-test-header'];
    ctx.body = { success: true };
    await next();
  },
  {
    body: z.object({ foo: z.number() }),
    query: z.object({ bar: z.string() }),
    params: z.object({ id: z.string() }),
    headers: z.object({ 'x-test-header': z.string() }),
    response: z.object({ success: z.boolean() }),
  },
);

router.register({
  name: 'post-example',
  method: 'post',
  path: '/post',
  pre: async (ctx, next) => {
    //... pre-handler
    await next();
  },
  handlers: [
    async (ctx, next) => {
      // const { foo } = ctx.request.body;
      // const { bar } = ctx.request.query;
      // const { id } = ctx.request.params;
      // ctx.request.headers['x-test-header'];
      // ctx.body = { hello: 'world' };
      ctx.body = { test: ctx.request.files.test.toJSON().originalFilename };

      await next();
    },
  ],
  validate: {
    // body: z.object({ foo: z.number() }),
    // params: z.object({ id: z.coerce.number() }),
    // query: z.object({ bar: z.string() }),
    // headers: z.object({ 'x-test-header': z.string() }),
    // response: z.object({ hello: z.string() }),
    files: z.object({
      test: zFile(),
    }),
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
