import { createRouteSpec } from '../src/util';
import { z } from 'zod';

export const getUserRoute = createRouteSpec({
  method: 'get',
  path: '/users',
  handler: (ctx) => {
    ctx.body = { success: true };
  },
  validate: {
    response: z.object({ success: z.boolean() }),
  },
});
