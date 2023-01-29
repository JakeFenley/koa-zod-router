import { z } from 'zod';
import specFactory from './state-helper-example';

export const getUserRoute = specFactory.createRouteSpec({
  method: 'get',
  path: '/user',
  handler: (ctx) => {
    const { user } = ctx.state;

    ctx.body = { user };
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
