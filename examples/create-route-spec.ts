import { createRouteSpec } from '../src/util';
import { z } from 'zod';

export const getUserRoute = createRouteSpec({
  method: ['post', 'patch'],
  path: '/users',
  handler: (ctx) => {
    ctx.request.body.hello;
    ctx.body = { success: true };
  },
  validate: {
    body: z.object({ hello: z.string() }),
    response: z.object({ success: z.boolean() }),
  },
});
