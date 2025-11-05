# ⚡ koa-zod-router ⚡

Inspired by koa-joi-router, this package aims to provide a similar feature-set while leveraging Zod and Typescript to create typesafe routes and middlewares with built in I/O validation.

![npm release](https://img.shields.io/npm/v/koa-zod-router?label=latest)
[![Coverage Status](https://coveralls.io/repos/github/JakeFenley/koa-zod-router/badge.svg?branch=main)](https://coveralls.io/github/JakeFenley/koa-zod-router?branch=main)
![downloads](https://img.shields.io/npm/dm/koa-zod-router)

[zod]: https://github.com/colinhacks/zod
[coercion]: https://zod.dev/?id=coercion-for-primitives
[@koa/bodyparser]: https://github.com/koajs/bodyparser
[formidable]: https://github.com/node-formidable/formidable
[@koa/router]: https://github.com/koajs/router

## 🔥 Features:

- Input/output validation and typesafety using [zod][]
- Body parsing using [@koa/bodyparser][]
- Multipart parsing using [formidable][]
- Wraps [@koa/router][], providing the same API but with typesafety and validation.
- Custom validation error handling support
- RegExp path support
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

### Adding state to routes

zodRouter accepts a type parameter for adding types to `ctx.state`, as well as providing a helper function used creating routes and middlewares with state types.

`route-state.ts:`

```js
import { routerSpecFactory } from 'koa-zod-router';

export type UserState = {
  user: {
    username: string;
    email: string;
    id: number;
  };
};

export const specFactory = routerSpecFactory<UserState>();

```

`auth-middleware.ts:`

```js
import { z } from 'zod';
import { specFactory } from './route-state';

export const authMiddleware = specFactory.createUseSpec({
  handler: async (ctx, next) => {
    // ... validate the session token

    // setting state is now typesafe
    ctx.state.user = {
      username: 'johndoe',
      email: 'example@email.com',
      id: 1,
    };

    await next();
  },
  validate: {
    // validation fails if `x-session-token` is not set in the HTTP request headers
    headers: z.object({ 'x-session-token': z.string() }),
  },
});
```

`get-user.ts:`

```js
import { z } from 'zod';
import { specFactory } from './route-state';

export const getUserRoute = specFactory.createRouteSpec({
  method: 'get',
  path: '/user/:id',
  handler: async (ctx) => {
    //.. our route has access to the ctx.state.user types now
    ctx.state.user;
  },
  validate: {
    /* validation here */
  },
});
```

`index.ts:`

```js
import zodRouter from 'koa-zod-router';
import { UserState } from './router-state';
import { authMiddleware } from './auth-middleware';
import { getUserRoute } from './get-user';

const router = zodRouter<UserState>();

router.use(authMiddleware);
router.register(getUserRoute);
```

### Exposing validation errors to the client

By default validation errors will respond with either a generic 400 or 500 error depending on whether the validation fails from the sent fields in the request, or if there is an issue in the response body.

To enable ZodErrors being exposed to the client simply use the following config:

```js
const router = zodRouter({
  zodRouter: { exposeRequestErrors: true, exposeResponseErrors: true },
});
```

### Type coercion

When dealing with route parameters, query strings, and headers the incoming data will be parsed as strings to begin with. From a validation standpoint this can potentially be painful to deal with when dealing with things like `Date` in javascript. Luckily [zod] has a built in [coercion] method attached to its primitive data types to solve this!

**convert a route parameter to a number:**

```js
router.register({
  path: '/users/:id',
  method: 'get',
  handler: async (ctx) => {
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
  handler: async (ctx) => {
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

koa-zod-router uses [formidable] for any requests received with the `Content-Type` header set to `multipart/*`.

This functionality is disabled by default, to enable this functionality create an instance of zodRouter and pass in `{ zodRouter: { enableMultipart: true } }` as your config. Then to validate files utilize the helper function `zFile`.

```js
import zodRouter, { zFile } from 'koa-zod-router';

const fileRouter = zodRouter({ zodRouter: { enableMultipart: true } });

fileRouter.register({
  path: '/uploads',
  method: 'post',
  handler: async (ctx) => {
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

## Custom Validation Error Handling
`koa-zod-router` allows users to implement router-wide error handling or route specific error handling.

### Router-wide error handling

By passing a function `validationErrorHandler` into `zodRouter` options you can execute an error handler that occurs immediately after the validation-middleware does it's thing.

```js
import { ValidationErrorHandler } from 'koa-zod-router';

const validationErrorHandler: ValidationErrorHandler = async (ctx, next) => {
  if (ctx.invalid.error) {
    ctx.status = 400;
    ctx.body = 'hello';
  } else {
    await next();
  }

  return;
};

const router = zodRouter({
  zodRouter: { exposeResponseErrors: true, validationErrorHandler },
});
```

### Route specific error handling
By enabling `continueOnError` you can bypass the default error handling done by the router's validation middleware and handle the errors the way you see fit.

```js
import zodRouter from 'koa-zod-router';
import { z } from 'zod';

const router = zodRouter();

//... create a custom error handler

router.register({
  method: 'get',
  path: '/foo',
  handler: [
    // error handler
    async (ctx, next) => {
      // check if an error was thrown
      if (ctx.invalid.error) {
        // destructure all of the ZodErrors from ctx.invalid
        const { body, headers, query, params, files } = ctx.invalid;
        //... handle ZodErrors
      } else {
        await next();
      }
    },
    async (ctx, next) => {
      // .. route handler
    },
  ],
  validate: {
    continueOnError: true,
    body: z.object({
      foo: z.string(),
    }),
  },
});
```

## API Reference

[Reference](https://github.com/JakeFenley/koa-zod-router/tree/main/docs/API.md)

## Feedback

Found a bug?
Please let me know in [Issues section](https://github.com/JakeFenley/koa-zod-router/issues).

Have a question or idea?
Please let me know in [Discussions section](https://github.com/JakeFenley/koa-zod-router/discussions).

Found a vulnerability or other security issue?
Please refer to [Security policy](https://github.com/JakeFenley/koa-zod-router/blob/main/SECURITY.md).
