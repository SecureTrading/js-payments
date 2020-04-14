import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalCommerce } from '../application/core/integrations/CardinalCommerce';
import { CardinalCommerceMock } from '../application/core/integrations/CardinalCommerceMock';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalCommerce, type: CardinalCommerceMock });
}
