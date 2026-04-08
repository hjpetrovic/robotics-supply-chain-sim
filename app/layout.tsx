import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Robotics Supply Chain Bottleneck Simulator",
  description:
    "Interactive simulator modelling materials, components, OEM capacity, and geopolitical risk constraints on global robot production.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
