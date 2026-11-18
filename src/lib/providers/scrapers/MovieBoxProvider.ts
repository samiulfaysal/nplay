import { BaseProvider } from './BaseProvider';
import { ProviderResult, StreamQuery } from '../types';

export class MovieBoxProvider extends BaseProvider {
  name = 'MovieBox';
  priority = 1;

  async resolve(query: StreamQuery): Promise<ProviderResult | null> {
    return null;
  }
}
