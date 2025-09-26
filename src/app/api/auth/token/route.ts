import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Validate required environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/oauth/callback`;

    if (!clientId || !clientSecret) {
      console.error('Missing required environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        redirectUri
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Token exchange attempt:', {
      hasCode: !!code,
      codeLength: code?.length,
      clientId: clientId?.substring(0, 10) + '...',
      redirectUri
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google token exchange error:', {
        status: response.status,
        statusText: response.statusText,
        error: data,
        redirectUri
      });
      return NextResponse.json(
        { error: data.error_description || data.error || 'Token exchange failed' },
        { status: response.status }
      );
    }

    console.log('Token exchange successful');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
