import { proxyPuruboy } from '../../_lib/proxyPuruboy';

export default async function handler(req: any, res: any) {
  return proxyPuruboy('/api/dramabox/category', req, res);
}
