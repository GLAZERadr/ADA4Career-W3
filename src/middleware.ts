// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { API_BASE_URL } from '@/constant/config';

import { routing } from './i18n/routing';

// Route constants
const LOGIN_ROUTE = '/?auth=login';
const JOBSEEKER_ROUTE = '/app/home/jobs';
const HR_ROUTE = '/app/hr/dashboard';

// Map paths to roles
const routeRoleMap = {
  '/': 'public',
  '/onboarding': 'onboarding',
  '/app/home/jobs': 'public', // Make jobs page publicly accessible for demo
  '/app/home': 'public', // Make home page publicly accessible for demo
  '/app/hr/dashboard': 'human_resources',
  '/app/profile': 'authenticated',
  '/app/cv-builder': 'public', // Make CV builder publicly accessible for Web3 demo
  '/web3-demo': 'public', // Make Web3 demo publicly accessible
};

// Skip middleware for these paths
function shouldSkipMiddleware(path: string) {
  return (
    path.includes('.') || // Static files
    path.startsWith('/_next') || // Next.js internal routes
    path.startsWith('/api') || // API routes
    path.startsWith('/trpc') || // tRPC routes
    path.startsWith('/_vercel') // Vercel internal routes
  );
}

// Skip authentication checks for demo routes
function shouldSkipAuth(pathWithoutLocale: string) {
  return (
    pathWithoutLocale === '/web3-demo' ||
    pathWithoutLocale.startsWith('/web3-demo/') ||
    pathWithoutLocale === '/app/cv-builder' ||
    pathWithoutLocale.startsWith('/app/cv-builder/') ||
    pathWithoutLocale === '/app/home/jobs' ||
    pathWithoutLocale.startsWith('/app/home/jobs/') ||
    pathWithoutLocale === '/app/home' ||
    pathWithoutLocale.startsWith('/app/home/')
  );
}

// Helper to get the current locale from path
function getLocaleFromPath(path: string, locales: string[]): string | null {
  for (const locale of locales) {
    if (path === `/${locale}` || path.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

// Helper to add locale prefix to URL if needed
function getLocalizedUrl(url: string, locale: string | null): string {
  if (!locale) return url;

  // If URL already starts with locale, don't add it again
  if (url.startsWith(`/${locale}/`) || url === `/${locale}`) {
    return url;
  }

  // Add locale to URL (handling root path specially)
  return url === '/' ? `/${locale}` : `/${locale}${url}`;
}

// The main middleware function that combines both internationalization and auth
export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip processing for certain paths
  if (shouldSkipMiddleware(path)) {
    return NextResponse.next();
  }

  // Get current locale from the path or default to null
  const currentLocale = getLocaleFromPath(path, [...routing.locales]);

  // Get the path without locale prefix for role determination
  const pathWithoutLocale = currentLocale
    ? path.substring(currentLocale.length + 1) || '/'
    : path;

  // Determine route role based on path without locale
  let routeRole = 'authenticated';
  for (const [pattern, role] of Object.entries(routeRoleMap)) {
    if (
      pathWithoutLocale === pattern ||
      pathWithoutLocale.startsWith(`${pattern}/`)
    ) {
      routeRole = role;
      break;
    }
  }

  // Skip auth for demo routes
  if (shouldSkipAuth(pathWithoutLocale)) {
    const i18nMiddleware = createMiddleware(routing);
    return i18nMiddleware(request);
  }

  // Auth check
  const redirectParam = request.nextUrl.searchParams.get('redirect');
  const token = request.cookies.get('ada4career-token')?.value;

  // Check if the user is authenticated
  if (!token) {
    if (routeRole === 'public' || routeRole === 'optional') {
      // Apply i18n routing for public routes
      const i18nMiddleware = createMiddleware(routing);
      return i18nMiddleware(request);
    }

    // For protected routes, redirect to login but preserve locale
    const loginPath = LOGIN_ROUTE;
    const localizedLoginPath = getLocalizedUrl(loginPath, currentLocale);

    const loginUrl = new URL(localizedLoginPath, request.url);
    if (redirectParam) {
      loginUrl.searchParams.set('redirect', redirectParam);
    } else if (path !== loginPath) {
      loginUrl.searchParams.set('redirect', path);
    }

    return NextResponse.redirect(loginUrl);
  }

  try {
    // Check if backend API is available
    let user = null;
    let userRole = null;

    // Skip API call and use demo mode directly
    console.log('Using demo mode - backend API calls disabled');

    // Demo mode: create mock user based on token presence
    if (token) {
        user = {
          id: 'demo-user',
          email: 'demo@ada4career.com',
          name: 'Demo User',
          gender: 'other', // Assume completed onboarding
          role: ['jobseeker'], // Default role for demo
          job_seeker_data: {
            resume_url: 'demo-resume-url',
            skill: 'Web3 Development, Blockchain',
            experiences: 'Demo experience data',
            expectations: 'Looking for Web3 opportunities'
          }
        };
        userRole = 'jobseeker';
      }

    // If no user data and invalid token, redirect to login
    if (!user || !userRole) {
      const loginPath = LOGIN_ROUTE;
      const localizedLoginPath = getLocalizedUrl(loginPath, currentLocale);

      const response = NextResponse.redirect(
        new URL(localizedLoginPath, request.url)
      );
      response.cookies.delete('ada4career-token');
      response.cookies.delete('ada4career-email');
      return response;
    }

    // Prepare the next response (but don't return it yet)
    const response = NextResponse.next();

    // Store email in cookies
    response.cookies.set('ada4career-email', user.email, {
      httpOnly: true,
      secure: true,
      path: '/',
    });

    // Check if user has completed gender selection
    const hasCompletedGenderSelection =
      user.gender === 'male' ||
      user.gender === 'female' ||
      user.gender === 'other';

    // Handle public routes
    if (routeRole === 'public') {
      // Check if user needs onboarding
      if (!hasCompletedGenderSelection) {
        const onboardingPath = '/onboarding';
        const localizedOnboardingPath = getLocalizedUrl(
          onboardingPath,
          currentLocale
        );
        return NextResponse.redirect(
          new URL(localizedOnboardingPath, request.url)
        );
      } else {
        // Redirect to appropriate dashboard
        const dashboardPath =
          userRole === 'jobseeker' ? JOBSEEKER_ROUTE : HR_ROUTE;
        const localizedDashboardPath = getLocalizedUrl(
          dashboardPath,
          currentLocale
        );
        return NextResponse.redirect(
          new URL(localizedDashboardPath, request.url)
        );
      }
    }

    // Handle onboarding routes
    if (routeRole === 'onboarding') {
      if (hasCompletedGenderSelection) {
        if (userRole === 'jobseeker') {
          // Check if resume is uploaded
          if (user.job_seeker_data?.resume_url) {
            const jobseekerPath = JOBSEEKER_ROUTE;
            const localizedJobseekerPath = getLocalizedUrl(
              jobseekerPath,
              currentLocale
            );
            return NextResponse.redirect(
              new URL(localizedJobseekerPath, request.url)
            );
          }
        } else {
          const hrPath = HR_ROUTE;
          const localizedHrPath = getLocalizedUrl(hrPath, currentLocale);
          return NextResponse.redirect(new URL(localizedHrPath, request.url));
        }
      }
    }

    // Handle role-specific routes
    if (
      (routeRole === 'jobseeker' && userRole !== 'jobseeker') ||
      (routeRole === 'human_resources' && userRole !== 'human_resources')
    ) {
      if (!hasCompletedGenderSelection) {
        const onboardingPath = '/onboarding';
        const localizedOnboardingPath = getLocalizedUrl(
          onboardingPath,
          currentLocale
        );
        return NextResponse.redirect(
          new URL(localizedOnboardingPath, request.url)
        );
      } else {
        const dashboardPath =
          userRole === 'jobseeker' ? JOBSEEKER_ROUTE : HR_ROUTE;
        const localizedDashboardPath = getLocalizedUrl(
          dashboardPath,
          currentLocale
        );
        return NextResponse.redirect(
          new URL(localizedDashboardPath, request.url)
        );
      }
    }

    // Apply i18n routing for authenticated routes that don't require redirect
    const i18nMiddleware = createMiddleware(routing);
    return i18nMiddleware(request);
  } catch (error) {
    console.error('Auth middleware error:', error);

    const loginPath = LOGIN_ROUTE;
    const localizedLoginPath = getLocalizedUrl(loginPath, currentLocale);

    const response = NextResponse.redirect(
      new URL(localizedLoginPath, request.url)
    );
    response.cookies.delete('ada4career-token');
    response.cookies.delete('ada4career-email');
    return response;
  }
}

export const config = {
  // Match all pathnames except for ones containing a dot (e.g. favicon.ico)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
