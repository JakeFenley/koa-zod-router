# API Reference

## zodRouter

### 🛠️ Options

| Param        | Type                | Description                                                                              |
| ------------ | ------------------- | ---------------------------------------------------------------------------------------- |
| [bodyParser] | <code>Object</code> | koa-bodyparser [options](https://github.com/koajs/bodyparser#options)                    |
| [formidable] | <code>Object</code> | formidable [options](https://github.com/node-formidable/formidable#options)              |
| [koaRouter]  | <code>Object</code> | @koa/router [options](https://github.com/koajs/router/blob/master/API.md#new-routeropts) |
| [zodRouter]  | <code>Object</code> | koa-zod-router [options](#koa-zod-router-options)                                        |

### zodRouter opts

| Param                    | Type                  | Default     | Description                                                                                        |
| ------------------------ | --------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| [enableMultipart]        | <code>Boolean</code>  | `false`     | Enable Multipart parser middleware, used for file uploads                                          |
| [exposeRequestErrors]    | <code>Boolean</code>  | `false`      | Send ZodErrors caused by client in response body                                                   |
| [exposeResponseErrors]   | <code>Boolean</code>  | `false`     | Send ZodErrors caused by the server in response body                                               |
| [validationErrorHandler] | <code>Function</code> | `undefined` | Set a middleware function that will immediately run after `koa-zod-router's` validation middleware |

Please see [@koa/router](https://github.com/koajs/router/blob/master/API.md) docs for any methods not mentioned in this doc. Only methods that have been wrapped or overridden are mentioned here. All other methods are delegated to koa-router.

**Example**:

### zodRouter.get|put|post|patch|delete|del ⇒ <code>KoaRouter</code>

Create `router.verb()` methods, where _verb_ is one of the HTTP verbs, such
as `router.get()` or `router.post()`.

Match URL patterns to callback functions or controller actions using `router.verb()`,
where **verb** is one of the HTTP verbs such as `router.get()` or `router.post()`.

Additionally, `router.all()` can be used to match against all methods. However validation is currently not supported using this method.

#### Create a route using a spec object:

| Param      | Type                                | Description                                                                                                           |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| path       | <code>String</code>                 | route path                                                                                                            |
| handler    | <code>function \| function[]</code> | handler function(s)                                                                                                   |
| [name]     | <code>String</code>                 | route name                                                                                                            |
| [opts]     | <code>Object</code>                 | [KoaRouter.LayerOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router/index.d.ts) |
| [validate] | <code>Object</code>                 | [validation schema](#validation-schema)                                                                               |

```javascript
router
  // Pass spec object as argument (recommended)
  .post({
    path: '/users/:id',
    name: 'users',
    handler: () => {
      // ...
    },
    validate: {
      // ...
    },
  })
  // or pass (path, handler, validation)
  .get(
    '/',
    (ctx, next) => {
      ctx.body = 'Hello World!';
    },
    {
      response: z.string(),
    },
  );
```

### zodRouter.register(spec) ⇒ <code>KoaRouter</code>

#### Create a route using a spec object:

| Param      | Type                                | Description                                                                                                           |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| path       | <code>String</code>                 | route path                                                                                                            |
| method     | <code>String \| String[]</code>     | HTTP verb(s)                                                                                                          |
| handler    | <code>function \| function[]</code> | handler function(s)                                                                                                   |
| [name]     | <code>String</code>                 | route name                                                                                                            |
| [opts]     | <code>Object</code>                 | [KoaRouter.LayerOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router/index.d.ts) |
| [validate] | <code>Object</code>                 | [validation schema](#validation-schema)                                                                               |

```javascript
router.register({
  name: 'users',
  path: 'users/:id',
  method: 'get',
  handler: (ctx, next) => {
    //...
  },
  validate: {
    //... validation options
  },
});
```

### Validation schema

| Param             | Type                 | Description                                                   |
| ----------------- | -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [headers]         | <code>Object</code>  | zod validation for `ctx.request.headers`                      |
| [body]            | <code>Object</code>  | zod validation for `ctx.request.body`                         |
| [params]          | <code>Object</code>  | zod validation for `ctx.request.params`                       |
| [query]           | <code>Object</code>  | zod validation for `ctx.request.query`                        |
| [files]           | <code>Object</code>  | zod validation for `ctx.request.files`                        |
| [response]        | <code>Object</code>  | zod validation for setting `ctx.body` and `ctx.response.body` |
| [continueOnError] | <code>Boolean</code> | `false`                                                       | Bypass koa-zod-router's error handling to use a custom implementation. Overrides any value set for `exposeRequestErrors` |

### zodRouter.use(spec) ⇒ <code>KoaRouter</code>

Use middleware with either [koa-router's implementation](https://github.com/ZijianHe/koa-router/blob/master/README.md#routerusepath-middleware--router) or optionally pass in a spec object for validation and type inference.

| Param      | Type                                | Description                             |
| ---------- | ----------------------------------- | --------------------------------------- |
| handler    | <code>function \| function[]</code> | handler function(s)                     |
| [path]     | <code>String</code>                 | middleware path                         |
| [pre]      | <code>function \| function[]</code> | pre-validation handler function(s)      |
| [validate] | <code>Object</code>                 | [validation schema](#validation-schema) |

**Example**:

```js
router.use({
  handler: async (ctx, next) => {
    // ...
    await next();
  },
  validate: {
    //...
  },
});
```

## createRouteSpec(spec) ⇒ <code>RouteSpec</code>

Utility function used for Importing/Exporting routes with type inference and validation.

### RouteSpec

| Param      | Type                                | Description                                                                                                           |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| path       | <code>String</code>                 | route path                                                                                                            |
| handler    | <code>function \| function[]</code> | handler function(s)                                                                                                   |
| [method]   | <code>String \| String[]</code>     | HTTP verb(s)                                                                                                          |
| [pre]      | <code>function \| function[]</code> | pre-validation handler function(s)                                                                                    |
| [name]     | <code>String</code>                 | route name                                                                                                            |
| [opts]     | <code>Object</code>                 | [KoaRouter.LayerOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router/index.d.ts) |
| [validate] | <code>Object</code>                 | [validation schema](#validation-schema)                                                                               |

**Example:**

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

## createUseSpec(spec) ⇒ <code>UseSpec</code>

### UseSpec

| Param      | Type                                | Description                             |
| ---------- | ----------------------------------- | --------------------------------------- |
| handler    | <code>function \| function[]</code> | handler function(s)                     |
| [path]     | <code>String</code>                 | middleware path                         |
| [pre]      | <code>function \| function[]</code> | pre-validation handler function(s)      |
| [validate] | <code>Object</code>                 | [validation schema](#validation-schema) |

Utility function used for importing/exporting middlewares with type inference and validation.

**Example:**

```js
import { createUseSpec } from 'koa-zod-router';

export const authMiddleware = createUseSpec({
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

`index.ts:`

```js
import zodRouter from 'koa-zod-router';
import { authMiddleware } from './auth-middleware';

const router = zodRouter();
router.use(authMiddleware);
```

## routerSpecFactory<State> ⇒ <code>{ createUseSpec, createRouteSpec }</code>

Utility function used for importing/exporting routes and middlewares with type parameter `State` passed onto `ctx.state`

**Example**

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

export const specFactory = routerSpecFactory<User>();

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

## zFile ⇒ <code>z.ZodType\<PersistentFile\> | z.ZodType\<VolatileFile\></code>

Utility function for validating file instance objects returned from [formidable](https://github.com/node-formidable/formidable)

**Example:**

```js
const fileRouter = zodRouter({ zodRouter: { enableMultipart: true } });

fileRouter.register({
  path: '/uploads',
  method: 'post',
  handler: (ctx) => {
    const { test_file } = ctx.request.files;
    //...
  },
  validate: {
    files: z.object({
      test_file: zFile(),
    }),
  },
});
```
