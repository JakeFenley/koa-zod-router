import Koa from 'koa';
import { z } from 'zod';
import zodRouter from '../src/zod-router';
import { getUserRoute } from './create-route-spec';
import { middlewareExample } from './create-use-spec';
import { UserState } from './types';

const app = new Koa();

const router = zodRouter<UserState>({
  zodRouter: { exposeRequestErrors: true, exposeResponseErrors: true },
});

router.use(middlewareExample);
router.register(getUserRoute);

router.register({
  name: 'post-example',
  method: 'post',
  path: '/post/:id',
  pre: async (ctx, next) => {
    //... optional pre-validation-handler
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
    params: z.object({ id: z.string().transform((id) => parseInt(id, 10)) }),
    query: z.object({ bar: z.string() }),
    headers: z.object({ 'x-test-header': z.string() }),
    response: z.object({ hello: z.string() }),
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
