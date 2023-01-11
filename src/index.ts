import Koa from 'koa';
import zodRouter from './zod-router';

const app = new Koa();

const router = zodRouter({ methods: ['get'] });

// router.get(
//   '/',
//   (ctx, next) => {
//     ctx.request.body;
//     console.log('handler');
//     ctx.body = 'DFASFASAS';
//     next();
//   },
//   {},
// );

router.register<{ hello: 'world' }>({
  method: 'post',
  path: '/post',
  pre: async (ctx, next) => {
    console.log('pre');
    await next();
  },
  handlers: [
    async (ctx, next) => {
      console.log('handler');
      ctx.request.body.hello = 12314;
      ctx.body = 'hello';
      await next();
    },
  ],
});

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
