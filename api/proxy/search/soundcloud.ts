import { proxyPuruboy } from '../../_lib/proxyPuruboy';

export default async function handler(req: any, res: any) {
  return proxyPuruboy('/api/search/soundcloud', req, res);
}
