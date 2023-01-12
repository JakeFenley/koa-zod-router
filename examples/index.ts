import Koa from 'koa';
import { z } from 'zod';
import zodRouter from '../src/zod-router';

const app = new Koa();

const router = zodRouter({ methods: ['get'] });

router.register({
  method: 'get',
  path: '/',
  handlers: (ctx, next) => {
    ctx.body = 'FSDAFASDF';
    next();
  },
});

router.register({
  method: 'post',
  path: '/post',
  pre: async (ctx, next) => {
    //... pre-handler
    await next();
  },
  handlers: [
    async (ctx, next) => {
      const { foo } = ctx.request.body;
      ctx.response.body = { success: true };
      await next();
    },
  ],
  validate: {
    body: z.object({ foo: z.number() }),
    query: z.object({ bar: z.string() }),
    headers: z.object({ 'x-test-header': z.string() }),
    response: z.object({ success: z.boolean() }),
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
