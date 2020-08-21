import { Container } from 'typedi';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { StoreConfigProvider } from '../services/store-config-provider/StoreConfigProvider';

Container.set({ id: ConfigProvider, type: StoreConfigProvider });
