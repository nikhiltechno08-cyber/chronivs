import { defaultMetadata, defaultViewport } from '@/constants/seo';
import { fontVariables } from '@/theme/fonts';
import { Providers } from '@/providers';
import { AppShell } from '@/components/layout';

import '@/theme/theme.css';

export const metadata = defaultMetadata;
export const viewport = defaultViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
