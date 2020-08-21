import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../application/core/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
}
