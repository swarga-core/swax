import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useEntity, useUpdater } from '../src/hooks/useEntity';
import Counter from './Counter';
import type { EntityUpdater } from '../src/hooks/useEntity';

interface CounterButtonProps {
  tag: string | null;
  count: number;
  updateCounter: EntityUpdater;
}

function CounterButton({ tag, count, updateCounter }: CounterButtonProps) {
  return (
    <button
      onClick={() => updateCounter({ count: count + 1 })}
    >{`${tag}: ${count}`}</button>
  );
}

function ButtonLab1() {
  const [counter, setCounter] = useEntity(Counter, 1, 'Counter');

  return (
    <div>
      {[...Array(3)].map((none, index) => (
        <CounterButton
          key={index}
          tag={`${counter.tag} (${index + 1})`}
          count={counter.count}
          updateCounter={setCounter}
        ></CounterButton>
      ))}
    </div>
  );
}

function ButtonLab2() {
  const [counter1, setCounter1] = useEntity(Counter, 1, 'Counter1');
  const [counter2, setCounter2] = useEntity(Counter, 1, 'Counter2');
  const [counter3, setCounter3] = useEntity(Counter, 1, 'Counter3');

  return (
    <div>
      <CounterButton
        tag={counter1.tag}
        count={counter1.count}
        updateCounter={setCounter1}
      ></CounterButton>
      <CounterButton
        tag={counter2.tag}
        count={counter2.count}
        updateCounter={setCounter2}
      ></CounterButton>
      <CounterButton
        tag={counter3.tag}
        count={counter3.count}
        updateCounter={setCounter3}
      ></CounterButton>
    </div>
  );
}

function ButtonLab3() {
  const [counter1] = useEntity(Counter, 1, 'Counter1');
  const [counter2] = useEntity(Counter, 1, 'Counter2');
  const [counter3] = useEntity(Counter, 1, 'Counter3');
  const setCounter1 = useUpdater(counter1);
  const setCounter2 = useUpdater(counter2);
  const setCounter3 = useUpdater(counter3);
  return (
    <div>
      <CounterButton
        tag={counter1.tag}
        count={counter1.count}
        updateCounter={setCounter1}
      ></CounterButton>
      <CounterButton
        tag={counter2.tag}
        count={counter2.count}
        updateCounter={setCounter2}
      ></CounterButton>
      <CounterButton
        tag={counter3.tag}
        count={counter3.count}
        updateCounter={setCounter3}
      ></CounterButton>
    </div>
  );
}

describe('the same entity in multiple places', function () {
  it('updates correctly', () => {
    render(<ButtonLab1 />);

    let buttons = screen.queryAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Counter (1): 1');
    expect(buttons[1]).toHaveTextContent('Counter (2): 1');
    expect(buttons[2]).toHaveTextContent('Counter (3): 1');

    fireEvent.click(screen.getByText('Counter (1): 1'));

    buttons = screen.queryAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Counter (1): 2');
    expect(buttons[1]).toHaveTextContent('Counter (2): 2');
    expect(buttons[2]).toHaveTextContent('Counter (3): 2');
  });
});

describe('different entities in multiple places', function () {
  it.each([<ButtonLab2 />, <ButtonLab3 />])(
    'do not interfere with simultaneous use',
    (component) => {
      render(component);

      let buttons = screen.queryAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Counter1: 1');
      expect(buttons[1]).toHaveTextContent('Counter2: 1');
      expect(buttons[2]).toHaveTextContent('Counter3: 1');

      fireEvent.click(screen.getByText('Counter3: 1'));

      buttons = screen.queryAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Counter1: 1');
      expect(buttons[1]).toHaveTextContent('Counter2: 1');
      expect(buttons[2]).toHaveTextContent('Counter3: 2');

      fireEvent.click(screen.getByText('Counter3: 2'));

      buttons = screen.queryAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Counter1: 1');
      expect(buttons[1]).toHaveTextContent('Counter2: 1');
      expect(buttons[2]).toHaveTextContent('Counter3: 3');

      fireEvent.click(screen.getByText('Counter2: 1'));

      buttons = screen.queryAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Counter1: 1');
      expect(buttons[1]).toHaveTextContent('Counter2: 2');
      expect(buttons[2]).toHaveTextContent('Counter3: 3');
    }
  );
});
