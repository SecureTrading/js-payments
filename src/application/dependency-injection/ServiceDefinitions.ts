import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config/ConfigProvider';
import { StoreConfigProvider } from '../core/services/StoreConfigProvider';

Container.set({ id: ConfigProvider, type: StoreConfigProvider });
