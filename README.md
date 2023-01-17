# ⚡ koa-zod-router ⚡

Inspired by koa-joi-router, this package aims to provide a similar feature-set while leveraging Zod and Typescript to create a fantastic dev experience.

![npm release](https://img.shields.io/npm/v/koa-zod-router?label=latest)
[![Coverage Status](https://coveralls.io/repos/github/JakeFenley/koa-zod-router/badge.svg?branch=main)](https://coveralls.io/github/JakeFenley/koa-zod-router?branch=main)
![downloads](https://img.shields.io/npm/dm/koa-zod-router)

[zod]: https://github.com/colinhacks/zod
[koa-bodyparser]: https://github.com/koajs/bodyparser
[formidable]: https://github.com/node-formidable/formidable
[@koa/router]: https://github.com/koajs/router
## 🔥 Features:

- Input/output validation and typesafety using [zod][]
- Body parsing using [koa-bodyparser][]
- Multipart parsing using [formidable][]
- Wraps [@koa/router][], providing the same API but with typesafety and validation.
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

### 🛠️ Options

| Param        | Type                | Description                                                                              |
| ------------ | ------------------- | ---------------------------------------------------------------------------------------- |
| [bodyParser] | <code>Object</code> | koa-bodyparser [options](https://github.com/koajs/bodyparser#options)                    |
| [formidable] | <code>Object</code> | formidable [options](https://github.com/node-formidable/formidable#options)              |
| [koaRouter]  | <code>Object</code> | @koa/router [options](https://github.com/koajs/router/blob/master/API.md#new-routeropts) |
| [zodRouter]  | <code>Object</code> | koa-zod-router [options](#⚙️-zodrouter-options)                                                                   |

#### ⚙️ zodRouter options

| Param                  | Type                 | Description                                               |
| ---------------------- | -------------------- | --------------------------------------------------------- |
| [enableMultipart]      | <code>Boolean</code> | Enable Multipart parser middleware, used for file uploads |
| [exposeRequestErrors]  | <code>Boolean</code> | Send ZodErrors caused by client in response body          |
| [exposeResponseErrors] | <code>Boolean</code> | Send ZodErrors caused by the server in response body      |

### Import/Exporting routes

Most likely you'll want to seperate your routes into seperate files, and register them somewhere else. To do this you can use the helper function createRouteSpec and specify the route's properties.

`get-user.ts:`

```js
import { createRouteSpec } from '../src/util';
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
import Koa from 'koa';
import zodRouter from 'koa-zod-router';
import { z } from 'zod';
import { getUserRoute } from './get-user.ts';

const app = new Koa();

const router = zodRouter();

router.register(getUserRoute);

app.use(router.routes());

app.listen(3000, () => {
  console.log('app listening on http://localhost:3000');
});
```