import type { Metadata } from 'next';
import {
  Baloo_2,
  Baloo_Tammudu_2,
  Baloo_Thambi_2,
  Noto_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Telugu,
  Noto_Sans_Tamil,
} from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/useLang';
import { Header } from '@/components/Header';

// Headings: Baloo 2 (Latin + Devanagari), Baloo Tammudu 2 (Telugu), Baloo Thambi 2 (Tamil).
const balooHeading = Baloo_2({
  variable: '--font-baloo2',
  subsets: ['latin', 'devanagari'],
  weight: ['500', '600', '700'],
});
const balooTelugu = Baloo_Tammudu_2({
  variable: '--font-baloo-tammudu2',
  subsets: ['latin', 'telugu'],
  weight: ['500', '600', '700'],
});
const balooTamil = Baloo_Thambi_2({
  variable: '--font-baloo-thambi2',
  subsets: ['latin', 'tamil'],
  weight: ['500', '600', '700'],
});

// Body: Noto Sans + script-specific Noto Sans variants.
const notoSans = Noto_Sans({ variable: '--font-noto-sans', subsets: ['latin'] });
const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: '--font-noto-sans-devanagari',
  subsets: ['devanagari'],
});
const notoSansTelugu = Noto_Sans_Telugu({ variable: '--font-noto-sans-telugu', subsets: ['telugu'] });
const notoSansTamil = Noto_Sans_Tamil({ variable: '--font-noto-sans-tamil', subsets: ['tamil'] });

const fontVariables = [
  balooHeading,
  balooTelugu,
  balooTamil,
  notoSans,
  notoSansDevanagari,
  notoSansTelugu,
  notoSansTamil,
]
  .map((font) => font.variable)
  .join(' ');

export const metadata: Metadata = {
  title: 'Yojana Saathi',
  description: 'Find out if a government scheme is for you — and exactly why.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
