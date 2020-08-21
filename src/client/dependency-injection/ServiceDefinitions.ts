import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config/ConfigProvider';
import { ConfigService } from '../config/ConfigService';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });

Container.import([PreventNavigationPopup]);
