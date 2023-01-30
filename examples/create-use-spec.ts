import { z } from 'zod';
import specFactory from './state-helper-example';

export const middlewareExample = specFactory.createUseSpec({
  handler: async (ctx, next) => {
    ctx.state.user = {
      email: 'hello@example.com',
      username: 'foo',
      id: 1,
    };
    await next();
  },
  validate: {
    headers: z.object({ authorization: z.string() }),
  },
});
