import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
