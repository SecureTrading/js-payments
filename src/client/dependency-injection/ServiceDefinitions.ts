import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config/ConfigProvider';
import { ConfigService } from '../config/ConfigService';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
