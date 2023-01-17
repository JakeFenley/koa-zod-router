import assert from 'assert';
import formidable from 'formidable';
import { describe, it } from 'node:test';
import { prepareMiddleware, assertValidation, assertHandlers, assertFormidableError } from '../src/util';

describe('prepareMiddleware', () => {
  it('should flatten array of handler', () => {
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

describe('assertHandlers', () => {
  it('should assert array of handler to be true', () => {
    const assertion = assertHandlers([() => {}, () => {}, () => {}]);

    assert(assertion);
  });

  it('should assert array of handler and strings to be false', () => {
    const assertionOne = assertHandlers([() => {}, () => {}, () => {}, 'str']);

    assert(!assertionOne);

    const assertionTwo = assertHandlers(['str', () => {}, () => {}, () => {}]);

    assert(!assertionOne);
  });

  it('should assert function as argument to be true', () => {
    assert(assertHandlers(() => {}));
  });

  it('should assert string as argument to be false', () => {
    assert(!assertHandlers('str'));
  });
});

describe('assertFormidableError', () => {
  it('should assert FormidableError instance to be true', () => {
    const assertion = assertFormidableError(new formidable.errors.FormidableError('whoops', 12312));
    assert(assertion);
  });

  it('should assert Error instance to be false', () => {
    const assertion = assertFormidableError(new Error());
    assert(!assertion);
  });
});
