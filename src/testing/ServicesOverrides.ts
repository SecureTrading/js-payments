import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalCommerce } from '../application/core/integrations/cardinal-commerce/CardinalCommerce';
import { CardinalCommerceMock } from './mocks/CardinalCommerceMock';
import { CardinalProvider } from '../application/core/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  // Container.set({ id: CardinalCommerce, type: CardinalCommerceMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
}
