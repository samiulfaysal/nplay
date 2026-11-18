import { NextRequest, NextResponse } from 'next/server';
import { getAppSettings, saveAppSettings } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getAppSettings();
    return NextResponse.json({ config, dbSettings: {} });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = await saveAppSettings(body);
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
