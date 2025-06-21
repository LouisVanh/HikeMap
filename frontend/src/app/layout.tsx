import './globals.css';
import 'leaflet/dist/leaflet.css';
import { Playfair_Display, Dancing_Script, Cormorant_Garamond, Marcellus } from 'next/font/google';

// Import all fonts as CSS variables
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cormorant',
});

const marcellus = Marcellus({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-marcellus',
});

export const metadata = {
  title: 'HikeMap',
  description: 'Find your favourite hikes and beautiful nature shots here',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"       
    className={`
        ${playfair.variable}
        ${dancing.variable}
        ${cormorant.variable}
        ${marcellus.variable}
      `}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
