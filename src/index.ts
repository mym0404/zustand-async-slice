import type { StateCreator } from 'zustand';

function isCallbacksObj(v: any): v is CallbacksWithParams<any, any> {
  return (
    v !== null &&
    typeof v === 'object' &&
    ('onSuccess' in v || 'onError' in v || 'onSettled' in v || 'onRun' in v)
  );
}

type CallbacksWithParams<State extends object, Params, Data = void> = {
  onSuccess?: (params: { params: Params; data: Data } & GetSetApi<State>) => void;
  onError?: (params: { params: Params; error: any } & GetSetApi<State>) => void;
  onSettled?: (
    params: {
      params: Params;
      data?: Data;
      error?: any;
      isSuccess: boolean;
      isError: boolean;
    } & GetSetApi<State>,
  ) => void;
  onRun?: (params: { params: Params } & GetSetApi<State>) => void;
};
type CallbacksWithoutParams<State extends object, Data = void> = {
  onSuccess?: (params: { data: Data } & GetSetApi<State>) => void;
  onError?: (params: { error: any } & GetSetApi<State>) => void;
  onSettled?: (
    params: {
      data?: Data;
      error?: any;
      isSuccess: boolean;
      isError: boolean;
    } & GetSetApi<State>,
  ) => void;
  onRun?: (params: {} & GetSetApi<State>) => void;
};

type AsyncSliceBaseType<Name extends string, Data> = Record<
  `is${Capitalize<Name>}Fetching`,
  boolean
> &
  Record<`is${Capitalize<Name>}Error`, boolean> &
  Record<`${Uncapitalize<Name>}Data`, Data | undefined>;

type AsyncSliceTypeWithParams<
  State extends object,
  Name extends string,
  Data,
  Params,
> = AsyncSliceBaseType<Name, Data> &
  Record<
    `run${Capitalize<Name>}`,
    (params: Params, callbacks?: CallbacksWithParams<State, Params, Data>) => void
  > &
  Record<`run${Capitalize<Name>}Async`, (params: Params) => Promise<Data>>;

type AsyncSliceTypeWithoutParams<
  State extends object,
  Name extends string,
  Data,
> = AsyncSliceBaseType<Name, Data> &
  Record<`run${Capitalize<Name>}`, (callbacks?: CallbacksWithoutParams<State, Data>) => void> &
  Record<`run${Capitalize<Name>}Async`, () => Promise<Data>>;

type GetSetApi<State> = {
  get: Parameters<StateCreator<State>>['1'];
  set: Parameters<StateCreator<State>>['0'];
};

type AsyncFnWithParams<State, Params, Data> = (
  params: Params,
  api: GetSetApi<State>,
) => Promise<Data> | Data;

type AsyncFnWithoutParams<State, Data> = (api: GetSetApi<State>) => Promise<Data> | Data;

export type WithAsyncState<T> = T extends { __T: infer U } ? U : never;

/* with parameter */
export function asyncSlice<State extends object, Params>(): <Name extends string, Data = void>(
  p: {
    name: Name;
    asyncFn: AsyncFnWithParams<State, Params, Data>;
  } & CallbacksWithParams<State, Params, Data>,
) => StateCreator<State, [], [], AsyncSliceTypeWithParams<State, Name, Data, Params>> & {
  __T: State & AsyncSliceTypeWithParams<State, Name, Data, Params>;
};

/* without parameter */
export function asyncSlice<State extends object>(): <Name extends string, Data = void>(
  p: {
    name: Name;
    asyncFn: AsyncFnWithoutParams<State, Data>;
  } & CallbacksWithoutParams<State, Data>,
) => StateCreator<State, [], [], AsyncSliceTypeWithoutParams<State, Name, Data>> & {
  __T: State & AsyncSliceTypeWithoutParams<State, Name, Data>;
};

export function asyncSlice<State = {}>(): (p: {
  name: string;
  asyncFn: Function;
  onSuccess?: Function;
  onError?: Function;
  onSettled?: Function;
  onRun?: Function;
}) => any {
  return ({
    name,
    asyncFn,
    onError,
    onRun,
    onSettled,
    onSuccess,
  }: {
    name: string;
    asyncFn: Function;
    onSuccess?: Function;
    onError?: Function;
    onSettled?: Function;
    onRun?: Function;
  }) => {
    const capitalName = !name ? '' : `${name[0].toUpperCase()}${name.slice(1)}`;
    const uncapitalName = !name ? '' : `${name[0].toLowerCase()}${name.slice(1)}`;

    const isNameFetchingKey = `is${capitalName}Fetching`;
    const isNameErrorKey = `is${capitalName}Error`;
    const dataKey = `${uncapitalName}Data`;
    const runKey = `run${capitalName}`;
    const runAsyncKey = `run${capitalName}Async`;

    const createRunAsyncFunction =
      (set: GetSetApi<State>['set'], get: GetSetApi<State>['get']) => async (params: any) => {
        try {
          onRun?.({ params, get, set });
          set({
            [isNameFetchingKey]: true,
            [isNameErrorKey]: false,
          } as Partial<State>);

          const data = await asyncFn(
            params === null || params === undefined
              ? { set, get }
              : typeof params === 'object'
                ? { ...params, set, get }
                : params,
            { set, get },
          );

          onSettled?.({ data, get, set, params, isSuccess: true, isError: false });
          onSuccess?.({ data, get, set, params });
          set({
            [isNameFetchingKey]: false,
            [dataKey]: data,
          } as Partial<State>);

          return data;
        } catch (error: any) {
          onSettled?.({ error, get, set, params, isSuccess: false, isError: true });
          onError?.({ error, get, set, params });
          set({
            [isNameFetchingKey]: false,
            [isNameErrorKey]: true,
          } as Partial<State>);
          // rethrow for non-async function
          throw error;
        }
      };

    return (set: GetSetApi<State>['set'], get: GetSetApi<State>['get']) => ({
      [isNameFetchingKey]: false,
      [isNameErrorKey]: false,
      [dataKey]: undefined,
      [runAsyncKey]: createRunAsyncFunction(set, get),
      [runKey]: (paramsOrCallbacks: any, callbacks?: CallbacksWithParams<any, any>) => {
        const runAsyncFn = createRunAsyncFunction(set, get);

        const onRunArg = isCallbacksObj(callbacks)
          ? callbacks?.onRun
          : isCallbacksObj(paramsOrCallbacks)
            ? paramsOrCallbacks?.onRun
            : undefined;

        const onSuccessArg = isCallbacksObj(callbacks)
          ? callbacks?.onSuccess
          : isCallbacksObj(paramsOrCallbacks)
            ? paramsOrCallbacks?.onSuccess
            : undefined;

        const onErrorArg = isCallbacksObj(callbacks)
          ? callbacks?.onError
          : isCallbacksObj(paramsOrCallbacks)
            ? paramsOrCallbacks?.onError
            : undefined;

        const onSettledArg = isCallbacksObj(callbacks)
          ? callbacks?.onSettled
          : isCallbacksObj(paramsOrCallbacks)
            ? paramsOrCallbacks?.onSettled
            : undefined;

        const santitizedParams = isCallbacksObj(paramsOrCallbacks) ? undefined : paramsOrCallbacks;
        onRunArg?.({ params: santitizedParams, get, set });
        runAsyncFn(santitizedParams)
          .then((data) => {
            onSettledArg?.({
              data,
              get,
              set,
              params: santitizedParams,
              isSuccess: true,
              isError: false,
            });
            onSuccessArg?.({ data, get, set, params: santitizedParams });
          })
          .catch((error: any) => {
            onSettledArg?.({
              error,
              get,
              set,
              params: santitizedParams,
              isSuccess: false,
              isError: true,
            });
            onErrorArg?.({ error, get, set, params: santitizedParams });
          });
      },
    });
  };
}
