import { z } from 'zod';
import specFactory from './state-helper-example';

export const getUserRoute = specFactory.createRouteSpec({
  method: 'get',
  path: '/user',
  handler: async (ctx, next) => {
    const { user } = ctx.state;

    ctx.body = { user };
    await next();
  },
  validate: {
    response: z.object({
      user: z.object({
        email: z.string(),
        id: z.number(),
        username: z.string(),
      }),
    }),
  },
});
