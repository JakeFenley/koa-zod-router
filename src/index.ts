import Koa from 'koa';
import zodRouter from './zod-router';

const app = new Koa();

const router = zodRouter();

// TODO: Fix this need to add
router.get('/', (ctx, next) => {});

// router.register({
//   method: 'get',
//   path: '/',
//   pre: async (ctx, next) => {
//     console.log('pre');
//     await next();
//   },
//   handlers: [
//     async (ctx, next) => {
//       console.log('handler');
//       ctx.body = 'hello';
//       await next();
//     },
//     (ctx, next) => {
//       console.log('post handler');
//       next();
//     },
//   ],
// });

app.use(router.middleware());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
