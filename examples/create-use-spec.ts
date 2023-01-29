import { z } from 'zod';
import specFactory from './state-helper-example';

export const middlewareExample = specFactory.createUseSpec({
  handler: (ctx, next) => {
    ctx.state.user = {
      email: 'hello@example.com',
      username: 'foo',
      id: 1,
    };
    void next();
  },
  validate: {
    headers: z.object({ authorization: z.string() }),
  },
});
