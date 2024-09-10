import { create } from 'zustand';

import type { WithAsyncState } from './index';
import { asyncSlice } from './index';

type State = {
  age: number;
};

it('increase value in the store with set in asyncFn', async () => {
  const slice = asyncSlice<State>()({
    name: 'hello',
    asyncFn: async ({ set }): Promise<number> => {
      set({ age: 1 });

      return 1;
    },
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello();

  expect(useStore.getState().age).toEqual(1);
});

it('[with arg] onRun callback from definition of slice called', async () => {
  const onRun = jest.fn();

  const slice = asyncSlice<State, { arg1: number }>()({
    name: 'hello',
    asyncFn: () => 1,
    onRun,
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello({ arg1: 1 });

  expect(onRun).toHaveBeenCalledTimes(1);
  expect(onRun).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
    params: { arg1: 1 },
  });
});

it('[with arg] onRun callback from the caller', async () => {
  const onRun = jest.fn();

  const slice = asyncSlice<State, { arg1: number }>()({
    name: 'hello',
    asyncFn: () => 1,
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello({ arg1: 1 }, { onRun });

  expect(onRun).toHaveBeenCalledTimes(1);
  expect(onRun).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
    params: { arg1: 1 },
  });
});

it('[no arg], onRun callback from definition of slice called', async () => {
  const onRun = jest.fn();

  const slice = asyncSlice<State>()({
    name: 'hello',
    asyncFn: () => 1,
    onRun,
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello();

  expect(onRun).toHaveBeenCalledTimes(1);
  expect(onRun).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
  });
});

it('[no arg], onRun callback from the caller', async () => {
  const onRun = jest.fn();

  const slice = asyncSlice<State>()({
    name: 'hello',
    asyncFn: () => 1,
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello({ onRun });

  expect(onRun).toHaveBeenCalledTimes(1);
  expect(onRun).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
  });
});

it('[with arg] onSettled, onError from definition of slice called', async () => {
  const onSettled = jest.fn();
  const onError = jest.fn();

  const slice = asyncSlice<State, { arg1: number }>()({
    name: 'hello',
    asyncFn: () => {
      throw 1;
    },
    onSettled,
    onError,
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello({ arg1: 1 });

  expect(onSettled).toHaveBeenCalledTimes(1);
  expect(onSettled).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
    params: { arg1: 1 },
    error: 1,
    isError: true,
    isSuccess: false,
  });

  expect(onError).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
    params: { arg1: 1 },
    error: 1,
  });
});

it('[with arg] onSettled, onError from the caller', (done) => {
  const onSettled = jest.fn();
  const onError = jest.fn();

  const slice = asyncSlice<State, { arg1: number }>()({
    name: 'hello',
    asyncFn: () => {
      throw 1;
    },
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello({ arg1: 1 }, { onSettled, onError });

  setTimeout(() => {
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith({
      get: useStore.getState,
      set: useStore.setState,
      params: { arg1: 1 },
      error: 1,
      isError: true,
      isSuccess: false,
    });

    expect(onError).toHaveBeenCalledWith({
      get: useStore.getState,
      set: useStore.setState,
      params: { arg1: 1 },
      error: 1,
    });
    done();
  }, 0);
});

it('[no arg] onSettled, onError from definition of slice called', async () => {
  const onSettled = jest.fn();
  const onError = jest.fn();

  const slice = asyncSlice<State>()({
    name: 'hello',
    asyncFn: () => {
      throw 1;
    },
    onSettled,
    onError,
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello();

  expect(onSettled).toHaveBeenCalledTimes(1);
  expect(onSettled).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
    error: 1,
    isError: true,
    isSuccess: false,
  });

  expect(onError).toHaveBeenCalledWith({
    get: useStore.getState,
    set: useStore.setState,
    error: 1,
  });
});

it('[no arg] onSettled, onError from the caller', (done) => {
  const onSettled = jest.fn();
  const onError = jest.fn();

  const slice = asyncSlice<State>()({
    name: 'hello',
    asyncFn: () => {
      throw 1;
    },
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));

  useStore.getState().runHello({ onSettled, onError });

  setTimeout(() => {
    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(onSettled).toHaveBeenCalledWith({
      get: useStore.getState,
      set: useStore.setState,
      error: 1,
      isError: true,
      isSuccess: false,
    });

    expect(onError).toHaveBeenCalledWith({
      get: useStore.getState,
      set: useStore.setState,
      error: 1,
    });
    done();
  }, 0);
});
