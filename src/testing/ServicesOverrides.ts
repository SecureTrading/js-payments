import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
}
