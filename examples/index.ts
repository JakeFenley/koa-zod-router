import Koa from 'koa';
import { z } from 'zod';
import zodRouter from '../src/zod-router';
import exportedRouter from './create-route-spec';

const app = new Koa();

const router = zodRouter({
  zodRouter: { exposeRequestErrors: true, exposeResponseErrors: true, enableMultipart: true },
});

router.register({
  name: 'post-example',
  method: 'post',
  path: '/post/:id',
  pre: async (ctx, next) => {
    //... pre-handler
    await next();
  },
  handler: [
    async (ctx, next) => {
      const { foo } = ctx.request.body;
      const { bar } = ctx.request.query;
      const { id } = ctx.request.params;
      ctx.request.headers['x-test-header'];
      ctx.body = { hello: 'world' };

      await next();
    },
  ],
  validate: {
    body: z.object({ foo: z.number() }),
    params: z.object({ id: z.coerce.number() }),
    query: z.object({ bar: z.string() }),
    headers: z.object({ 'x-test-header': z.string() }),
    response: z.object({ hello: z.string() }),
  },
});

app.use(router.routes());
app.use(exportedRouter.middleware());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
