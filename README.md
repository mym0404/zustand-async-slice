# Zustand Async Slice

🦄 Zustand Utility For Creating Async Slice easily in TypeScript!

![JS Check](https://github.com/mym0404/zustand-async-slice/workflows/JS%20Check/badge.svg)

## Install

```
yarn add zustand-async-slice
```

## Usage

The `asyncSlice` function automatically creates and manages various states inside the Zustand Store by simply passing the slice name to `name` and the asynchronous function to `asyncFn`.

It even provides full support for TypeScript. 🔥

### Auto Generated States in Store ♥️

name: `hello`

- `isHelloFetching: boolean`
- `isHelloError: boolean`
- `helloData: Data` (type parameter `Data` is inferred return type of `asyncFn`)
- `runHello: (params: Params) => Promise<Data>` (type parameter `Params` should be passed second argument of `asyncSlice`.)
- `runHello: () => Promise<Data>` (is there no params? then no arg function will be generated ‼️)

### Step 1. Create Async Slice with `asyncSlice`

Let's create a async slice named `Hello` by passing `Hello` string to `name` parameter.

```ts
import { asyncSlice } from 'zustand-async-slice';

const helloSlice = asyncSlice<StoreState, { name: string }>()({
  name: 'Hello',
  asyncFn: () => {
    return 1;
  },
});
```

### Step 2. Create 
