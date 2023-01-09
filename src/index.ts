import Koa from 'koa';
import KoaRouter from '@koa/router';

const app = new Koa();

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(3000);
