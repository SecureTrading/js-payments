import { Epic } from 'redux-observable';
import { mapTo, switchMap } from 'rxjs/operators';
import { ActionName, IAction } from '../IAction';
import { UPDATE_CONFIG } from '../reducers/config/IConfigActionsMap';
import { ofType } from '../operators/ofType';
import { EMPTY } from 'rxjs';

export const dummyEpic: Epic<IAction> = action$ =>
  action$.pipe(
    ofType(UPDATE_CONFIG),
    mapTo({ type: 'FOO' as ActionName })
    // switchMap(() => EMPTY),
  );
