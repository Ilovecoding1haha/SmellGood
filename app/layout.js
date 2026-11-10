import './globals.css';

export const metadata = {
  title: 'SmellGood — Creator Fund · $500 for 100+ followers',
  description:
    'SmellGood pays $500 to Instagram creators with 100+ followers. Free three-bar box, no contract, paid within 48 hours.',
  openGraph: {
    title: 'SmellGood Creator Fund',
    description: '$500 and a free box for creators with 100+ followers.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
