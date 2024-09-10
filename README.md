# Zustand Async Slice

🦄 Zustand Utility For Creating Async Slice easily in TypeScript!

![JS Check](https://github.com/mym0404/zustand-async-slice/workflows/JS%20Check/badge.svg)

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
  onRun: ({ get, set }) => {},
  onSettled: ({ get, set, data, error, isError, isSuccess }) => {},
  onSuccess: ({ get, set, data }) => {},
  onError: ({ get, set, error }) => {},
});
```

>[!NOTE]
> Yes, `get` and `set` are it in zustand store API.
> The type of `get` and `set` are inferred from first type parameter of `asyncSlice`(`MyStoreState`).

#### With Parameter Version





### Step 2. Create 
