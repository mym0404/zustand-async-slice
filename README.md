# Zustand Async Slice

🦄 Zustand Utility For Creating Async Slice easily in TypeScript!

![JS Check](https://github.com/mym0404/zustand-async-slice/workflows/JS%20Check/badge.svg)

## Install

```
yarn add zustand-async-slice
```

## Usage

### Step 1. Create Async Slice with `asyncSlice`

```ts
import { asyncSlice } from 'zustand-async-slice';

const helloSlice = asyncSlice<StoreState, { name: string }>()({
  name: 'Hello',
  asyncFn: () => {
    return 1;
  },
});
```
