import { renderHook, act } from '@testing-library/react-hooks';
import { useEntity } from '../src/hooks/useEntity';
import Counter from './Counter';

describe('useEntity()', () => {
  it('returns correct default initial state', () => {
    const { result } = renderHook(() => useEntity(Counter));
    const [counter] = result.current;

    expect(counter instanceof Counter).toBe(true);
    expect(counter.count).toBe(0);
    expect(counter.tag).toBe(null);
    expect(Object.keys(counter).length).toBe(0);
    expect(Object.isFrozen(counter)).toBe(true);

    const master = Object.getPrototypeOf(counter);
    expect(Object.isFrozen(master)).toBe(true);
    expect(Object.keys(master).length).toBe(2);
  });

  it('returns correct specific initial state', () => {
    const { result } = renderHook(() => useEntity(Counter, 10, 'Tag'));
    const [counter] = result.current;

    expect(counter instanceof Counter).toBe(true);
    expect(counter.count).toBe(10);
    expect(counter.tag).toBe('Tag');
    expect(Object.keys(counter).length).toBe(0);
    expect(Object.isFrozen(counter)).toBe(true);

    const master = Object.getPrototypeOf(counter);
    expect(Object.isFrozen(master)).toBe(true);
    expect(Object.keys(master).length).toBe(2);
  });

  it('can produce new correct state', () => {
    const { result } = renderHook(() => useEntity(Counter, 1, 'Default'));
    const [counter1, setCounter] = result.current;
    const master1 = Object.getPrototypeOf(counter1);

    expect(counter1.count).toBe(1);
    expect(counter1.tag).toBe('Default');

    act(() => {
      setCounter({ count: 2 });
    });

    const [counter2] = result.current;
    const master2 = Object.getPrototypeOf(counter1);

    expect(counter2 instanceof Counter).toBe(true);
    expect(counter2.count).toBe(2);
    expect(counter2.tag).toBe('Default');
    expect(Object.isFrozen(counter2)).toBe(true);

    expect(counter1).not.toBe(counter2);
    expect(counter1).not.toEqual(counter2);
    expect(master1).toBe(master2);
  });

  it('is the same object after rerender', () => {
    const { result, rerender } = renderHook(() => useEntity(Counter));
    const [counter1] = result.current;
    expect(counter1.count).toBe(0);
    rerender();
    rerender();
    rerender();
    const [counter2] = result.current;
    expect(counter1).toBe(counter2);
  });

  it('does not interfere with simultaneous use', () => {
    const { result: result1 } = renderHook(() => useEntity(Counter, 1, 'Tag1'));
    const [, setCounter1] = result1.current;
    const { result: result2 } = renderHook(() => useEntity(Counter, 2, 'Tag2'));
    const [, setCounter2] = result2.current;
    act(() => {
      setCounter1({ count: 11, tag: 'Tag11' });
      setCounter2({ count: 22 });
    });
    const [counter1] = result1.current;
    const [counter2] = result2.current;
    expect(counter1.count).toBe(11);
    expect(counter1.tag).toBe('Tag11');
    expect(counter2.count).toBe(22);
    expect(counter2.tag).toBe('Tag2');
  });
});
