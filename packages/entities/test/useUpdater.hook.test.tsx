import { renderHook, act } from '@testing-library/react-hooks';
import { useEntity, useUpdater } from '../src/hooks/useEntity';
import Counter from './Counter';

describe('useUpdater()', () => {
  it('can produce new correct state by default updater', () => {
    const { result: entityResult } = renderHook(() =>
      useEntity(Counter, 1, 'Default')
    );
    const [counter1] = entityResult.current;
    const master1 = Object.getPrototypeOf(counter1);

    expect(counter1.count).toBe(1);
    expect(counter1.tag).toBe('Default');
    expect(Object.keys(counter1).length).toBe(0);
    expect(Object.keys(master1).length).toBe(2);

    const { result: updaterResult } = renderHook(() => useUpdater(counter1));
    const setCounter = updaterResult.current;

    act(() => {
      setCounter({ count: 2 });
    });

    const [counter2] = entityResult.current;
    const master2 = Object.getPrototypeOf(counter1);

    expect(counter2 instanceof Counter).toBe(true);
    expect(counter2.count).toBe(2);
    expect(counter2.tag).toBe('Default');
    expect(Object.keys(counter2).length).toBe(1);
    expect(Object.isFrozen(counter2)).toBe(true);

    expect(counter1).not.toBe(counter2);
    expect(counter1).not.toEqual(counter2);
    expect(master1).toBe(master2);
  });

  it('can produce new correct state by restricted updater', () => {
    const { result: entityResult } = renderHook(() =>
      useEntity(Counter, 1, 'Default')
    );
    const [counter1] = entityResult.current;
    const master1 = Object.getPrototypeOf(counter1);

    expect(counter1.count).toBe(1);
    expect(counter1.tag).toBe('Default');
    expect(Object.keys(counter1).length).toBe(0);
    expect(Object.keys(master1).length).toBe(2);

    const { result: updaterResult } = renderHook(() =>
      useUpdater(counter1, ['count'])
    );
    const setCounterCount = updaterResult.current;

    act(() => {
      setCounterCount({ count: 2, tag: 'Tag2' });
    });

    const [counter2] = entityResult.current;
    const master2 = Object.getPrototypeOf(counter1);

    expect(counter2 instanceof Counter).toBe(true);
    expect(counter2.count).toBe(2);
    expect(counter2.tag).toBe('Default');
    expect(Object.keys(counter2).length).toBe(1);
    expect(Object.isFrozen(counter2)).toBe(true);

    expect(counter1).not.toBe(counter2);
    expect(counter1).not.toEqual(counter2);
    expect(master1).toBe(master2);
  });

  it('resets changed attributes of entity correctly', () => {
    const { result: entityResult } = renderHook(() =>
      useEntity(Counter, 1, 'Default')
    );
    const [counter1] = entityResult.current;
    const master1 = Object.getPrototypeOf(counter1);

    expect(counter1.count).toBe(1);
    expect(counter1.tag).toBe('Default');
    expect(Object.keys(counter1).length).toBe(0);
    expect(Object.keys(master1).length).toBe(2);

    const { result: updaterResult } = renderHook(() => useUpdater(counter1));
    const setCounter = updaterResult.current;

    act(() => {
      setCounter({ count: 2, tag: 'Tag2' });
    });

    const [counter2] = entityResult.current;
    expect(counter2 instanceof Counter).toBe(true);
    expect(counter2.count).toBe(2);
    expect(counter2.tag).toBe('Tag2');
    expect(Object.keys(counter2).length).toBe(2);
    expect(Object.isFrozen(counter2)).toBe(true);

    act(() => {
      setCounter(null);
    });

    const [counter3] = entityResult.current;
    const master3 = Object.getPrototypeOf(counter3);

    expect(counter3 instanceof Counter).toBe(true);
    expect(counter3.count).toBe(1);
    expect(counter3.tag).toBe('Default');
    expect(Object.keys(counter3).length).toBe(0);
    expect(Object.isFrozen(counter3)).toBe(true);

    expect(counter1).not.toBe(counter3);
    expect(counter1).toEqual(counter3);
    expect(master1).toBe(master3);

    act(() => {
      setCounter({ count: 4, tag: 'Tag4' });
    });

    const [counter4] = entityResult.current;
    const master4 = Object.getPrototypeOf(counter3);

    expect(counter4 instanceof Counter).toBe(true);
    expect(counter4.count).toBe(4);
    expect(counter4.tag).toBe('Tag4');
    expect(Object.keys(counter4).length).toBe(2);
    expect(Object.isFrozen(counter4)).toBe(true);
    expect(master1).toBe(master4);
  });
});
