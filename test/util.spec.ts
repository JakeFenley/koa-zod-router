import assert from 'assert';
import { describe, it } from 'node:test';
import { prepareMiddleware } from '../src/util';

describe('prepareMiddleware', () => {
  it('should flatten array of handlers', () => {
    const middlewares = prepareMiddleware([() => {}, [() => {}, () => {}]]);
  });
});
