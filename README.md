# Zustand Async Slice

🦄 Zustand Utility For Creating Async Slice easily in TypeScript!

## Introduce

The `asyncSlice` function automatically creates and manages various states inside the Zustand Store by simply passing the slice name to `name` and the asynchronous function to `asyncFn`.

It even provides full support for TypeScript. 🔥

It minimizes the hassle for developers to manually write types, ensuring a smooth developer experience


## Install

```
yarn add zustand-async-slice
```

## Usage


### Auto Generated States in Store ♥️

name: `hello`

- `isHelloFetching: boolean`
- `isHelloError: boolean`
- `helloData: Data` (type parameter `Data` is inferred return type of `asyncFn`)
- `runHello: (params: Params) => Promise<Data>` (type parameter `Params` should be passed second argument of `asyncSlice`.)
- `runHello: () => Promise<Data>` (is there no params? then no arg function will be generated ‼️)

### Step 1. Create Async Slice with `asyncSlice`

Let's create a async slice named `Hello` by passing `Hello` string to `name` parameter.

#### No Parameter Version

```ts
const helloSlice = asyncSlice<MyStoreState>()({
  name: 'hello',
  asyncFn: async ({ get, set }) => {
    await new Promise((r) => setTimeout(r, 3000)); // wait 3 seconds
    return 1;
  },
  // on asyncFn has benn called
  onRun: ({ get, set }) => {},
  // on asyncFn has benn completed as success or failure
  onSettled: ({ get, set, data, error, isError, isSuccess }) => {},
  // on asyncFn has benn completed as success
  onSuccess: ({ get, set, data }) => {},
  // on asyncFn has benn completed as error
  onError: ({ get, set, error }) => {},
});
```

>[!NOTE]
> Yes, `get` and `set` are those in Zustand store API.
> The type of `get` and `set` are inferred from first type parameter of `asyncSlice`(`MyStoreState`).


#### With Parameter Version

```ts
const helloSlice = asyncSlice<MyStoreState, { arg1: number; arg2: string }>()({
  name: 'Hello',
  asyncFn: async ({ arg1, arg2 }, { get, set }) => {
    await new Promise((r) => setTimeout(r, 3000)); // wait 3 seconds
    return 1;
  },
  onRun: ({ params, get, set }) => {},
  onSettled: ({ params, get, set, data, error, isError, isSuccess }) => {},
  onSuccess: ({ params, get, set, data }) => {},
  onError: ({ params, get, set, error }) => {},
});
```

Check that the parameter type of the async function is defined as the second argument of `asyncSlice` and that `params` are added to each callback function.



### Step 2. Inject slice into original store `create` process.

```ts
import type { WithAsyncState } from 'zustand-async-slice';

export type MyStoreState = { age: number };

export const useMyStore = create<WithAsyncState<typeof helloSlice>>()((set, get, store) => ({
  age: 0,
  ...helloSlice(set, get, store), // Inject
}));
```

Thanks to `WrapAsyncState`, we can simply pass the slice's type to it, and without needing to redefine the existing Store's type using `&`, we can just pass it as a type argument to `create`.


### Step 3. Use the store in the way you enjoy.

![](https://raw.githubusercontent.com/mym0404/image-archive/master/202409101608163.png)


