import Koa from 'koa';
import { z } from 'zod';
import zodRouter from './zod-router';

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
    ctx.request.body.foo;
    await next();
  },
  handlers: [
    async (ctx, next) => {
      const { foo } = ctx.request.body;
      foo;
      ctx.body = 'hello';
      await next();
    },
  ],
  validate: {
    body: z.object({ foo: z.number() }),
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
