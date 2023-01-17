# ⚡ koa-zod-router ⚡

Inspired by koa-joi-router, this package aims to provide a similar feature-set while leveraging Zod and Typescript to create a fantastic dev experience.

![npm release](https://img.shields.io/npm/v/koa-zod-router?label=latest)
[![Coverage Status](https://coveralls.io/repos/github/JakeFenley/koa-zod-router/badge.svg?branch=main)](https://coveralls.io/github/JakeFenley/koa-zod-router?branch=main)
![downloads](https://img.shields.io/npm/dm/koa-zod-router)

[zod]: https://github.com/colinhacks/zod
[coercion]: https://zod.dev/?id=coercion-for-primitives
[koa-bodyparser]: https://github.com/koajs/bodyparser
[formidable]: https://github.com/node-formidable/formidable
[@koa/router]: https://github.com/koajs/router

## 🔥 Features:

- Input/output validation and typesafety using [zod][]
- Body parsing using [koa-bodyparser][]
- Multipart parsing using [formidable][]
- Wraps [@koa/router][], providing the same API but with typesafety and validation.
- Lightweight
- CJS and ESM support

## 🚀 Install

```sh
npm install koa-zod-router
```

## 🚦 Quickstart

`index.ts:`

```js
import Koa from 'koa';
import zodRouter from 'koa-zod-router';
import { z } from 'zod';

const app = new Koa();

const router = zodRouter();

router.register({
  name: 'example',
  method: 'post',
  path: '/post/:id',
  handler: async (ctx, next) => {
    const { foo } = ctx.request.body;
    ctx.body = { hello: 'world' };

    await next();
  },
  validate: {
    params: z.object({ id: z.coerce.number() }),
    body: z.object({ foo: z.number() }),
    response: z.object({ hello: z.string() }),
  },
});

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
```

### Importing/Exporting routes

Most likely you'll want to seperate your routes into seperate files, and register them somewhere in your app's initialization phase. To do this you can use the helper function createRouteSpec and specify the route's properties.

`get-user.ts:`

```js
import { createRouteSpec } from 'koa-zod-router';
import { z } from 'zod';

export const getUserRoute = createRouteSpec({
  method: 'get',
  path: '/user/:id',
  handler: (ctx) => {
    ctx.body = {
      /* payload here */
    };
  },
  validate: {
    params: z.object({ id: z.coerce.number() }),
    response: z.object({
      /* validation here */
    }),
  },
});
```

`index.ts:`

```js
import zodRouter from 'koa-zod-router';
import { getUserRoute } from './get-user.ts';

const router = zodRouter();
router.register(getUserRoute);
```

### Type coercion

When dealing with route parameters and query strings the incoming data will be parsed as strings to begin with. From a validation standpoint this can potentially be painful to deal with when dealing with things like dates in javascript. Luckily [zod] has a built in [coercion] method attached to its primitive data types to solve this!

`convert a route parameter to a number:`

```js
router.register({
  path: '/users/:id',
  method: 'get',
  handler: (ctx) => {
    console.log(typeof ctx.request.params.id);
    // 'number'
  },
  validate: {
    params: z.object({ id: z.coerce.number() }),
  },
});
```

### Dealing with dates

As mentioned above type coercion can be very useful in a lot of situations, especially when dealing with dates. Since `Date` cannot be passed directly into JSON we must convert both the data received and the data being sent back to the client. Avoid using `z.date()` in your schemas as these will result in validation errors. Instead use `z.coerce.date()` for input data, and `z.string()` (or your choice of primitive data-type) for output.

```js
router.register({
  path: '/date',
  method: 'post',
  handler: (ctx) => {
    const { date } = ctx.request.body;
    console.log(date instanceof Date);
    // true
    ctx.body = {
      date: date.toISOString(),
    };
  },
  validate: {
    body: z.object({ date: z.coerce.date() }), // converts received string or number into date object
    response: z.object({ date: z.string() }),
  },
});
```

### Dealing with files

koa-zod-router uses [formidable] for any requests received with the `Content-Type` header set to `multipart/*`. This functionality is disabled by default, to enable this functionality create an instance of zodRouter and pass in `{ zodRouter: { enableMultipart: true } }` as your config. Then to validate files utilize the helper function `zFile`.

```js
const fileRouter = zodRouter({ zodRouter: { enableMultipart: true } });

fileRouter.register({
  path: '/uploads',
  method: 'post',
  handler: (ctx) => {
    const { file_one, multiple_files } = ctx.request.files;
    //...
  },
  validate: {
    body: z.object({ hello: z.string() }),
    files: z.object({
      file_one: zFile(),
      multiple_files: z.array(zFile()).or(zFile()),
    }),
  },
});
```

## API Reference

[reference](https://github.com/JakeFenley/koa-zod-router/tree/main/docs/API.md)

## Feedback

Found a bug? Have a question or idea?
Please let me know in [Issues section](https://github.com/JakeFenley/koa-zod-router/issues).

Found a vulnerability or other security issue?
Please refer to [Security policy](https://github.com/JakeFenley/koa-zod-router/blob/main/SECURITY.md).