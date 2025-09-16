import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import * as React from 'react';
import { ToastContainer } from 'react-toastify';

import '@/styles/globals.css';
import '@/styles/colors.css';

import AbsolutePositionWidget from '@/components/accessiblity-widget/AbsolutePositionWidget';
import ImplementWidget from '@/components/accessiblity-widget/ImplementWidget';
import KeyboardNavigationDialog from '@/components/accessiblity-widget/KeyboardNavigationDialog';
import { ReactQueryClientProvider } from '@/components/layout/query-provider';
import { Web3Provider } from '@/contexts/Web3Context';

import { siteConfig } from '@/constant/config';
import { routing } from '@/i18n/routing';

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: `/favicon/site.webmanifest`,
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [`${siteConfig.url}/images/og.jpg`],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/og.jpg`],
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <ReactQueryClientProvider>
      <Web3Provider>
        <html lang={locale}>
          <body>
            <NextIntlClientProvider locale={locale}>
              <AbsolutePositionWidget />
              <KeyboardNavigationDialog />
              <ImplementWidget />
              <ToastContainer />
              <NuqsAdapter>{children}</NuqsAdapter>
            </NextIntlClientProvider>
          </body>
        </html>
      </Web3Provider>
    </ReactQueryClientProvider>
  );
}
