import { BaseProvider } from './BaseProvider';
import { ProviderResult, StreamQuery } from '../types';

export class WeFeedProvider extends BaseProvider {
  name = 'WeFeed';
  priority = 2;

  async resolve(_query: StreamQuery): Promise<ProviderResult | null> {
    return null;
  }
}
