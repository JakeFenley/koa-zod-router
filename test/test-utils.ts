import Koa from 'koa';
import { ZodRouter } from 'src/types';
import supertest from 'supertest';
import http from 'http';

export const request = (app: Koa) => {
  return supertest(http.createServer(app.callback()));
};

export const createApp = (router: ZodRouter) => {
  const app = new Koa();

  app.use(router.middleware());
  return app;
};
