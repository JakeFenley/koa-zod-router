import assert from 'assert';
import { describe, it } from 'node:test';
import { prepareMiddleware, assertValidation } from '../src/util';

describe('prepareMiddleware', () => {
  it('should flatten array of handlers', () => {
    const middlewares = prepareMiddleware([() => {}, [() => {}, () => {}], [() => {}, () => {}, () => {}], () => {}]);

    assert(middlewares.length === 7);
  });
});

describe('assertValidation', () => {
  it('should return false when validation props are missing', () => {
    const validation = assertValidation({});

    assert(!validation);
  });

  it('should return true when validation prop params exists', () => {
    const validation = assertValidation({ params: {} });
    assert(validation);
  });

  it('should return true when validation prop headers exists', () => {
    const validation = assertValidation({ headers: {} });
    assert(validation);
  });

  it('should return true when validation prop query exists', () => {
    const validation = assertValidation({ query: {} });
    assert(validation);
  });

  it('should return true when validation prop body exists', () => {
    const validation = assertValidation({ body: {} });
    assert(validation);
  });

  it('should return true when validation prop response exists', () => {
    const validation = assertValidation({ response: {} });
    assert(validation);
  });

  it('should return true when files prop response exists', () => {
    const validation = assertValidation({ files: {} });
    assert(validation);
  });

  it('should return true when provided a mix of props', () => {
    const validation = assertValidation({ response: {}, params: {}, body: {} });
    assert(validation);
  });
});
