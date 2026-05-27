global.IS_REACT_ACT_ENVIRONMENT = true;

import React, { useEffect, act } from 'react';
import { createRoot } from 'react-dom/client';
import useLocalStorage from './useLocalStorage';

describe('useLocalStorage', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    window.localStorage.clear();
  });

  afterEach(() => {
    act(() => {
      if (root) {
        root.unmount();
      }
    });
    document.body.removeChild(container);
    container = null;
  });

  it('reads and writes values to localStorage and updates state', () => {
    let currentSetValue;

    const TestComponent = () => {
      const [value, setValue] = useLocalStorage('test-key-1', 'initial');
      currentSetValue = setValue;
      return <div id="val">{value}</div>;
    };

    act(() => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

    expect(container.querySelector('#val').textContent).toBe('initial');

    act(() => {
      currentSetValue('new-value');
    });

    expect(container.querySelector('#val').textContent).toBe('new-value');
    expect(window.localStorage.getItem('test-key-1')).toBe(JSON.stringify('new-value'));
  });

  it('stabilizes the setValue reference', () => {
    let currentSetValue;
    const setValueReferences = [];

    const TestComponent = () => {
      const [value, setValue] = useLocalStorage('test-key-2', 'initial');
      currentSetValue = setValue;
      
      useEffect(() => {
        setValueReferences.push(setValue);
      }, [setValue]);

      return <div id="val">{value}</div>;
    };

    act(() => {
      root = createRoot(container);
      root.render(<TestComponent />);
    });

    expect(container.querySelector('#val').textContent).toBe('initial');

    act(() => {
      currentSetValue('updated-value-1');
    });

    expect(container.querySelector('#val').textContent).toBe('updated-value-1');

    act(() => {
      currentSetValue('updated-value-2');
    });

    expect(container.querySelector('#val').textContent).toBe('updated-value-2');

    // setValue reference should stay stable across state updates
    expect(setValueReferences.length).toBe(1);
  });
});
