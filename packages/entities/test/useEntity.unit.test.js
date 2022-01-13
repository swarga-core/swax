import { makeEntity, entityReducer, deepFreeze } from '../src/hooks/useEntity';

class Counter {
  constructor(count = 0, tag = null) {
    this.count = count;
    this.tag = tag;
  }
}

const READ_ONLY_ERROR = 'Cannot assign to read only property';

describe('makeEntity()', function () {
  it('returns entity with correct default initial state', () => {
    const entityInfo = {
      entityClass: Counter,
      initialArgs: [],
    };
    const counter = makeEntity(entityInfo);
    expect(counter instanceof Counter).toBe(true);
    expect(counter.count).toBe(0);
    expect(counter.tag).toBe(null);
  });

  it('returns entity with correct specific initial state', () => {
    const entityInfo = {
      entityClass: Counter,
      initialArgs: [10, 'Tag'],
    };
    const counter = makeEntity(entityInfo);
    expect(counter instanceof Counter).toBe(true);
    expect(counter.count).toBe(10);
    expect(counter.tag).toBe('Tag');
  });
});

describe('entityReducer()', function () {
  it('returns correct updated values for correct change object', () => {
    const entityInfo = {
      entityClass: Counter,
      initialArgs: [],
    };
    const counter = makeEntity(entityInfo);
    const updatedCounter = entityReducer(counter, { count: 2, tag: 'Tag' });
    expect(updatedCounter.count).toBe(2);
    expect(updatedCounter.tag).toBe('Tag');
    expect(counter).not.toBe(updatedCounter);
  });

  it('returns previous immutable for incorrect change object', () => {
    const entityInfo = {
      entityClass: Counter,
      initialArgs: [1, 'Tag1'],
    };
    const counter = makeEntity(entityInfo);
    const updatedCounter = entityReducer(counter, { count2: 2, tag2: 'Tag2' });
    expect(updatedCounter.count).toBe(1);
    expect(updatedCounter.tag).toBe('Tag1');
    expect('count2' in updatedCounter).toBe(false);
    expect('tag2' in updatedCounter).toBe(false);
    expect(counter).toBe(updatedCounter);
  });
});

describe('deepFreeze()', function () {
  it('returns deeply frosen object', () => {
    const obj = {
      a: 1,
      b: 'default',
      c: [11, 22, 33],
      d: { e: 44, f: { g: 12 } },
    };
    const frozenObj = deepFreeze(obj);
    expect(Object.isFrozen(obj)).toBe(true);
    expect(Object.isFrozen(obj.c)).toBe(true);
    expect(Object.isFrozen(obj.d)).toBe(true);
    expect(Object.isFrozen(obj.d.f)).toBe(true);
    expect(() => {
      obj.d.f.g = 13;
    }).toThrowError(READ_ONLY_ERROR);
    expect(() => {
      obj.c[1] = 26;
    }).toThrowError(READ_ONLY_ERROR);
    expect(() => {
      obj.c.push(26);
    }).toThrowError('Cannot add property 3, object is not extensible');
  });
});
