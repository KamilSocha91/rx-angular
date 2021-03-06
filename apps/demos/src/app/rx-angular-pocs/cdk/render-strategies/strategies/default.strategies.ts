import { ɵmarkDirty as markDirty } from '@angular/core';
import { tap } from 'rxjs/operators';
import { coalesceWith } from '../../utils/rxjs/operators/coalesceWith';
import { StrategyCredentials, StrategyCredentialsMap } from '../model/strategy-credentials';
import { animationFrameTick } from '../../utils/rxjs/observable/tick-animationFrame';

export function getDefaultStrategyCredentialsMap(): StrategyCredentialsMap {
  return {
    global: globalCredentials,
    native: nativeCredentials,
    noop: noopCredentials,
    local: localCredentials
  };
}

const localCredentials: StrategyCredentials = {
  name: 'local',
  work: (cdRef, _, notification) => {
    cdRef.detectChanges();
  },
  behavior: (work: any, scope) => o$ => o$.pipe(
    coalesceWith(animationFrameTick(), scope),
    tap(() => work())
  )
};

const globalCredentials: StrategyCredentials = {
  name: 'global',
  work: (_, context) => markDirty(context),
  behavior: (work: any) => o$ => o$.pipe(tap(() => work()))
};

const noopCredentials: StrategyCredentials = {
  name: 'noop',
  work: () => void 0,
  behavior: () => o$ => o$
};

const nativeCredentials: StrategyCredentials = {
  name: 'native',
  work: (cdRef) => cdRef.markForCheck(),
  behavior: (work: any) => o$ => o$.pipe(tap(() => work()))
};

