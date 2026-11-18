import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await verifyAdmin();
    return NextResponse.json({
      isAuthenticated: auth.isAuthenticated,
      isAdmin: auth.isAdmin,
      user: auth.user,
    });
  } catch {
    return NextResponse.json({
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    });
  }
}
