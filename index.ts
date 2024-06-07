import { useServerInsertedHTML } from 'next/navigation';
import { createElement, ReactNode } from 'react';
import { useExecutorManager } from 'react-executor';
import { SSRExecutorManager } from 'react-executor/ssr';

export function ExecutorHydrator(props: { children?: ReactNode }): ReactNode {
  const executorManager = useExecutorManager();

  useServerInsertedHTML(() => {
    if (executorManager instanceof SSRExecutorManager) {
      const source = executorManager.nextHydrationScript();

      if (source !== '') {
        return createElement('script', { nonce: executorManager.nonce, dangerouslySetInnerHTML: source });
      }
    }
  });

  return props.children;
}
