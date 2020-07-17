import { from } from 'rxjs';
import { ofType } from './ofType';
import { toArray } from 'rxjs/operators';
import { ActionName } from '../IAction';

describe('ofType operator', () => {
  it('should only pass actions of given type', done => {
    const actions = [{ type: 'FOO' as ActionName }, { type: 'BAR' as ActionName }, { type: 'XYZ' as ActionName }];

    from(actions)
      .pipe(ofType('FOO' as ActionName), toArray())
      .subscribe(result => {
        expect(result).toEqual([{ type: 'FOO' }]);
        done();
      });
  });
});
