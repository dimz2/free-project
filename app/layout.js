import "./globals.css";

export const metadata = {
  title: "Variant Gallery",
  description: "Character variant gallery",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
