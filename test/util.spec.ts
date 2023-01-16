import assert from 'assert';
import { describe, it } from 'node:test';
import { prepareMiddleware, assertValidation } from '../src/util';

describe('prepareMiddleware', () => {
  it('should flatten array of handlers', () => {
    let execOrder: number[] = [];

    const middlewares = prepareMiddleware([
      () => {
        execOrder.push(0);
      },
      [
        () => {
          execOrder.push(1);
        },
        () => {
          execOrder.push(2);
        },
      ],
      [
        () => {
          execOrder.push(3);
        },
        () => {
          execOrder.push(4);
        },
        () => {
          execOrder.push(5);
        },
      ],
      () => {
        execOrder.push(6);
      },
    ]);

    for (const fn of middlewares) {
      // @ts-ignore
      fn({}, {});
    }

    assert.deepEqual(execOrder, [0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('assertValidation', () => {
  it('should return false when validation props are missing', () => {
    const validation = assertValidation({});

    assert.equal(validation, false);
  });

  it('should return true when validation prop params exists', () => {
    const validation = assertValidation({ params: {} });
    assert.equal(validation, true);
  });

  it('should return true when validation prop headers exists', () => {
    const validation = assertValidation({ headers: {} });
    assert.equal(validation, true);
  });

  it('should return true when validation prop query exists', () => {
    const validation = assertValidation({ query: {} });
    assert.equal(validation, true);
  });

  it('should return true when validation prop body exists', () => {
    const validation = assertValidation({ body: {} });
    assert.equal(validation, true);
  });

  it('should return true when validation prop response exists', () => {
    const validation = assertValidation({ response: {} });
    assert.equal(validation, true);
  });

  it('should return true when files prop response exists', () => {
    const validation = assertValidation({ files: {} });
    assert.equal(validation, true);
  });

  it('should return true when provided a mix of props', () => {
    const validation = assertValidation({ response: {}, params: {}, body: {} });
    assert.equal(validation, true);
  });
});
