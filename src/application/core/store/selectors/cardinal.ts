import { IState } from '../IState';
import { ICardinalCommerceTokens } from '../../integrations/cardinal-commerce/ICardinalCommerceTokens';

export function selectTokens(state: IState): ICardinalCommerceTokens {
  const { cacheToken, jwt } = state.cardinal;

  return { cacheToken, jwt };
}
