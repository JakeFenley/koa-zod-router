import Koa from 'koa';
import zodRouter from './zod-router';

const app = new Koa();

const router = zodRouter();

// TODO: Fix this
// router.get('/', {

// })

router.route({
  method: 'get',
  path: '/',
  handlers: (ctx, next) => {
    ctx.body = 'hello';
  },
});

app.use(router.middleware());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
