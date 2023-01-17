# koa-zod-router

Inspired by koa-joi-router, this package aims to provide a similar feature-set while leveraging Zod and Typescript to create a fantastic dev experience.

![npm release](https://img.shields.io/npm/v/koa-zod-router?label=latest)
[![Coverage Status](https://coveralls.io/repos/github/JakeFenley/koa-zod-router/badge.svg?branch=main)](https://coveralls.io/github/JakeFenley/koa-zod-router?branch=main)
![downloads](https://img.shields.io/npm/dm/koa-zod-router)

[zod]: https://github.com/colinhacks/zod
[koa-bodyparser]: https://github.com/koajs/bodyparser
[formidable]: https://github.com/node-formidable/formidable
[@koa/router]: https://github.com/koajs/router

#### Features:

- input/output validation using [zod][]
- body parsing using [koa-bodyparser][]
- multipart parsing using [formidable][]
- wraps [@koa/router][], providing the same API but with typesafety and validation.


#### Example

```js
import Koa from 'koa';
import { zFile } from '../src/util';
import { z } from 'zod';
import zodRouter from '../src/zod-router';

const app = new Koa();

const router = zodRouter();

router.register({
  name: 'post-example',
  method: 'post',
  path: '/post/:id',
  pre: async (ctx, next) => {
    //... pre-handler
    await next();
  },
  handlers: [
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

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
```