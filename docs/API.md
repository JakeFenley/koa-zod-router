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

| Param                  | Type                 | Default | Description                                               |
| ---------------------- | -------------------- | ------- | --------------------------------------------------------- |
| [enableMultipart]      | <code>Boolean</code> | `false` | Enable Multipart parser middleware, used for file uploads |
| [exposeRequestErrors]  | <code>Boolean</code> | `false` | Send ZodErrors caused by client in response body          |
| [exposeResponseErrors] | <code>Boolean</code> | `false` | Send ZodErrors caused by the server in response body      |

Please see [@koa/router](https://github.com/koajs/router/blob/master/API.md) docs for any methods not mentioned in this doc. Only methods that have been wrapped or overridden are mentioned here. All other methods are delegated to koa-router.

**Example**:

### zodRouter.get|put|post|patch|delete|del ⇒ <code>KoaRouter</code>

Create `router.verb()` methods, where _verb_ is one of the HTTP verbs, such
as `router.get()` or `router.post()`.

Match URL patterns to callback functions or controller actions using `router.verb()`,
where **verb** is one of the HTTP verbs such as `router.get()` or `router.post()`.

Additionally, `router.all()` can be used to match against all methods. However validation is currently not supported using this method.

#### Create a route using a spec object:

| Param        | Type                                | Description                                                                                                           |
| ------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| path         | <code>String</code>                 | route path                                                                                                            |
| handler      | <code>function \| function[]</code> | handler function(s)                                                                                                   |
| [name]       | <code>String</code>                 | route name                                                                                                            |
| [opts]       | <code>Object</code>                 | [KoaRouter.LayerOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router/index.d.ts) |
| [validation] | <code>Object</code>                 | [validation schema](#validation-schema)                                                                               |

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

| Param        | Type                                | Description                                                                                                           |
| ------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| path         | <code>String</code>                 | route path                                                                                                            |
| method       | <code>String \| String[]</code>     | HTTP verb(s)                                                                                                          |
| handler      | <code>function \| function[]</code> | handler function(s)                                                                                                   |
| [name]       | <code>String</code>                 | route name                                                                                                            |
| [opts]       | <code>Object</code>                 | [KoaRouter.LayerOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router/index.d.ts) |
| [validation] | <code>Object</code>                 | [validation schema](#validation-schema)                                                                               |

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

| Param      | Type                | Description                                                   |
| ---------- | ------------------- | ------------------------------------------------------------- |
| [headers]  | <code>Object</code> | zod validation for `ctx.request.headers`                      |
| [body]     | <code>Object</code> | zod validation for `ctx.request.body`                         |
| [params]   | <code>Object</code> | zod validation for `ctx.request.params`                       |
| [query]    | <code>Object</code> | zod validation for `ctx.request.query`                        |
| [files]    | <code>Object</code> | zod validation for `ctx.request.files`                        |
| [response] | <code>Object</code> | zod validation for setting `ctx.body` and `ctx.response.body` |

## createRouteSpec(spec) ⇒ <code>RouteSpec</code>

Utility function used for Importing/Exporting routes with type inference.

### Spec

| Param        | Type                                | Description                                                                                                           |
| ------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| path         | <code>String</code>                 | route path                                                                                                            |
| handler      | <code>function \| function[]</code> | handler function(s)                                                                                                   |
| [method]     | <code>String \| String[]</code>     | HTTP verb(s)                                                                                                          |
| [name]       | <code>String</code>                 | route name                                                                                                            |
| [opts]       | <code>Object</code>                 | [KoaRouter.LayerOptions](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/koa__router/index.d.ts) |
| [validation] | <code>Object</code>                 | [validation schema](#validation-schema)                                                                               |

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
