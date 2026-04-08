import "./globals.css";

export const metadata = {
  title: "Robotics Supply Chain Bottleneck Simulator",
  description:
    "Interactive simulator modelling materials, components, OEM capacity, and geopolitical risk constraints on global robot production.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
