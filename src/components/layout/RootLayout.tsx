import { SpeedInsights } from '@vercel/speed-insights/react';
import { Outlet, ScrollRestoration } from 'react-router-dom';

import { useSync } from '../../lib/useSync';
import MouseTrail from '../ui/MouseTrail';
import PageFlicker from '../ui/PageFlicker';
import XpToast from '../ui/XpToast';

import Footer from './Footer';
import Navbar from './Navbar';

export default function RootLayout() {
  useSync();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
      <MouseTrail />
      <PageFlicker />
      <XpToast />
      <SpeedInsights />
    </div>
  );
}
