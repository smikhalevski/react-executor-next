# @react-executor/next

To enable data streaming for Next.js applications provide
an [`ExecutorManager`](https://smikhalevski.github.io/react-executor/classes/react_executor.ExecutorManager.html)

```tsx
// providers.tsx
'use client';

import * as React from 'react';
import { enableSSRHydration, ExecutorManager, ExecutorManagerProvider } from 'react-executor';
import { SSRExecutorManager } from 'react-executor/ssr';
import { ExecutorHydrator } from '@react-executor/next';

const manager = typeof window !== 'undefined' ? enableSSRHydration(new ExecutorManager()) : undefined;

export function Providers(props: { children: React.ReactNode }) {
  return (
    <ExecutorManagerProvider value={manager || new SSRExecutorManager()}>
      <ExecutorHydrator>{props.children}</ExecutorHydrator>
    </ExecutorManagerProvider>
  );
}
```

`ExecutorHydrator` propagates server-rendered executor state from the server to the client.

Enable providers in the root layout:

```tsx
// layout.tsx
import { Providers } from './providers';

export default function (props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
}
```

Render the page that uses executors:

```tsx
// page.tsx
'use client';

import { Suspense } from 'react';
import { useExecutor, useExecutorSuspense } from 'react-executor';

export default function () {
  return (
    <Suspense>
      <App/>
    </Suspense>
  );
}

function App() {
  const executor = useExecutor('greeting', () => {
    // Fetch the data here
    return 'Hello'
  });

  useExecutorSuspense(executor);
  
  return executor.get()
}
```
