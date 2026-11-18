import { NextResponse } from 'next/server';
import { BdixProvider, CIRCLE_FTP_BASE, DHAKA_FLIX_SERVERS } from '@/lib/providers/bdix';

export async function GET() {
  const isReachable = await BdixProvider.isReachable();

  return NextResponse.json({
    reachable: isReachable,
    message: isReachable
      ? 'BDIX network detected. High-speed local mirrors enabled.'
      : 'Standard international network. BDIX mirrors idle.',
    circleFtpBase: CIRCLE_FTP_BASE,
    dhakaFlixMirrors: DHAKA_FLIX_SERVERS.length,
  });
}
