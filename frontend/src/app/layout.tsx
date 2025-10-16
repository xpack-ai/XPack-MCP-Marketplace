import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import ClientRootProviders from "@/shared/components/ClientRootProviders";
import "./globals.css";
import {
  getCachedPlatformConfig,
  getDynamicTitle,
  createBaseMetadata,
} from "@/shared/utils/metadata";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const platformConfig = await getDynamicTitle();
  return createBaseMetadata(platformConfig);
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const platformConfig = await getCachedPlatformConfig();

  return (
    <html lang="en" suppressHydrationWarning data-color-mode="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.localStorage.setItem("i18nextLng", "${platformConfig?.platform?.language || "en"}");
            `,
          }}
        />
      </head>
      <body className={redHatDisplay.className} suppressHydrationWarning>
        {platformConfig?.embeded_html?.is_enabled &&
          platformConfig?.embeded_html?.html && (
            <div
              dangerouslySetInnerHTML={{
                __html: platformConfig.embeded_html.html,
              }}
            />
          )}
        <ClientRootProviders initConfig={platformConfig}>
          {children}
        </ClientRootProviders>
      </body>
    </html>
  );
}
