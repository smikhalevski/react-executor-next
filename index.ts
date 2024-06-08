import { useServerInsertedHTML } from 'next/navigation';
import { createElement, ReactNode } from 'react';
import { useExecutorManager } from 'react-executor';
import { SSRExecutorManager } from 'react-executor/ssr';

export function ExecutorHydrator(props: { children?: ReactNode }): ReactNode {
  const manager = useExecutorManager();

  useServerInsertedHTML(() => {
    if (manager instanceof SSRExecutorManager) {
      const source = manager.nextHydrationScript();

      if (source !== '') {
        return createElement('script', { nonce: manager.nonce, dangerouslySetInnerHTML: { __html: source } });
      }
    }
  });

  return props.children;
}
