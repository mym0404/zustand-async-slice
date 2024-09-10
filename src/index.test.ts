import { create } from 'zustand';

import type { WithAsyncState } from './index';
import { asyncSlice } from './index';

type State = {};

it('', () => {
  const slice = asyncSlice<State>()({
    name: 'hello',
    asyncFn: async (): Promise<number> => {
      return 1;
    },
  });

  const useStore = create<WithAsyncState<typeof slice>>((set, get, store) => ({
    age: 0,
    ...slice(set, get, store),
  }));
});
