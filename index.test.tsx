import { render, waitFor } from '@testing-library/react';
import { useServerInsertedHTML } from 'next/navigation';
import React, { Suspense } from 'react';
import { ExecutorManagerProvider, useExecutor, useExecutorSuspense } from 'react-executor';
import { SSRExecutorManager } from 'react-executor/ssr';
import { ExecutorHydrator } from './index';

Date.now = () => 50;

jest.mock('next/navigation', () => {
  return {
    __esModule: true,
    useServerInsertedHTML: jest.fn(),
  };
});

beforeEach(() => {
  (useServerInsertedHTML as jest.Mock).mockReset();
});

describe('ExecutorHydrator', () => {
  test('renders undefined if there no changes in state', () => {
    const manager = new SSRExecutorManager();

    render(
      <ExecutorManagerProvider value={manager}>
        <ExecutorHydrator />
      </ExecutorManagerProvider>
    );

    expect(useServerInsertedHTML).toHaveBeenCalledTimes(1);
    expect((useServerInsertedHTML as jest.Mock).mock.calls[0][0]()).toBeUndefined();
  });

  test('returns the hydration chunk for a single executor', async () => {
    const manager = new SSRExecutorManager();

    const Component = () => {
      useExecutorSuspense(useExecutor('xxx', () => 111));
      return 'hello';
    };

    const result = render(
      <ExecutorManagerProvider value={manager}>
        <ExecutorHydrator>
          <Suspense>
            <Component />
          </Suspense>
        </ExecutorHydrator>
      </ExecutorManagerProvider>
    );

    await waitFor(() => result.findByText('hello'));

    expect(useServerInsertedHTML).toHaveBeenCalledTimes(1);
    expect((useServerInsertedHTML as jest.Mock).mock.calls[0][0]()).toEqual(
      <script
        dangerouslySetInnerHTML={{
          __html:
            '(window.__REACT_EXECUTOR_SSR_STATE__=window.__REACT_EXECUTOR_SSR_STATE__||[]).push("{\\"key\\":\\"xxx\\",\\"isFulfilled\\":true,\\"value\\":111,\\"annotations\\":{},\\"settledAt\\":50,\\"invalidatedAt\\":0}");var e=document.currentScript;e&&e.parentNode.removeChild(e);',
        }}
      />
    );
  });

  test('respects nonce', async () => {
    const manager = new SSRExecutorManager({ nonce: '111' });

    const Component = () => {
      useExecutorSuspense(useExecutor('xxx', () => 111));
      return 'hello';
    };

    const result = render(
      <ExecutorManagerProvider value={manager}>
        <ExecutorHydrator>
          <Suspense>
            <Component />
          </Suspense>
        </ExecutorHydrator>
      </ExecutorManagerProvider>
    );

    await waitFor(() => result.findByText('hello'));

    expect(useServerInsertedHTML).toHaveBeenCalledTimes(1);
    expect((useServerInsertedHTML as jest.Mock).mock.calls[0][0]()).toEqual(
      <script
        nonce={'111'}
        dangerouslySetInnerHTML={{
          __html:
            '(window.__REACT_EXECUTOR_SSR_STATE__=window.__REACT_EXECUTOR_SSR_STATE__||[]).push("{\\"key\\":\\"xxx\\",\\"isFulfilled\\":true,\\"value\\":111,\\"annotations\\":{},\\"settledAt\\":50,\\"invalidatedAt\\":0}");var e=document.currentScript;e&&e.parentNode.removeChild(e);',
        }}
      />
    );
  });
});
