import type { StateCreator } from 'zustand';

type AsyncSliceBaseType<Name extends string, Data> = Record<
  `is${Capitalize<Name>}Fetching`,
  boolean
> &
  Record<`is${Capitalize<Name>}Error`, boolean> &
  Record<`${Uncapitalize<Name>}Data`, Data | undefined>;

type AsyncSliceTypeWithoutParams<Name extends string, Data> = AsyncSliceBaseType<Name, Data> &
  Record<`run${Capitalize<Name>}`, () => Promise<Data>>;

type AsyncSliceTypeWithParams<Name extends string, Data, Params> = AsyncSliceBaseType<Name, Data> &
  Record<`run${Capitalize<Name>}`, (params: Params) => Promise<Data>>;

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
export function asyncSlice<State extends object, Params>(): <Name extends string, Data = void>(p: {
  name: Name;
  asyncFn: AsyncFnWithParams<State, Params, Data>;
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
}) => StateCreator<State, [], [], AsyncSliceTypeWithParams<Name, Data, Params>> & {
  __T: State & AsyncSliceTypeWithParams<Name, Data, Params>;
};

/* without parameter */
export function asyncSlice<State extends object>(): <Name extends string, Data = void>(p: {
  name: Name;
  asyncFn: AsyncFnWithoutParams<State, Data>;
  onSuccess?: (params: { data: Data } & GetSetApi<State>) => void;
  onError?: (params: { error: any } & GetSetApi<State>) => void;
  onSettled?: (
    params: { data?: Data; error?: any; isSuccess: boolean; isError: boolean } & GetSetApi<State>,
  ) => void;
  onRun?: (params: {} & GetSetApi<State>) => void;
}) => StateCreator<State, [], [], AsyncSliceTypeWithoutParams<Name, Data>> & {
  __T: State & AsyncSliceTypeWithoutParams<Name, Data>;
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

    return (set: GetSetApi<State>['set'], get: GetSetApi<State>['get']) => ({
      [isNameFetchingKey]: false,
      [isNameErrorKey]: false,
      [dataKey]: undefined,
      [runKey]: async (params: any) => {
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
        }
      },
    });
  };
}
