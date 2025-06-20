import './globals.css';
import 'leaflet/dist/leaflet.css';

export const metadata = {
  title: 'HikeMap',
  description: 'Find your favourite hikes and beautiful nature shots here',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
