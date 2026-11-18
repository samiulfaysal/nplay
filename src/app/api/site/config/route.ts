import { NextResponse } from 'next/server';
import { getAppSettings } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getAppSettings();

    return NextResponse.json({
      publicRegistration: settings.publicRegistration !== false,
      adminEmail: settings.adminEmail || 'admin@netfly.tv',
    });
  } catch {
    return NextResponse.json({
      publicRegistration: true,
      adminEmail: 'admin@netfly.tv',
    });
  }
}
