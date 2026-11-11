import React from 'react';
import { Outlet } from 'react-router';
import { NavbarDonador } from './components/NavbarDonador';
import { Footer } from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ManadaProvider } from './context/ManadaContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AdminProvider } from './context/AdminContext';
import { FoundationProvider } from './context/FoundationContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { PagoProvider } from './context/PagoContext';
import { ManadaFloatingBar } from './components/ManadaFloatingBar';
import { Toaster } from './components/ui/sonner';

export function RootLayout() {
  return (
    <AuthProvider>
      <ManadaProvider>
        <SubscriptionProvider>
          <AdminProvider>
            <FoundationProvider>
              <NotificationProvider>
                <FavoritosProvider>
                  <PagoProvider>
                  <div className="min-h-screen bg-white font-['Host_Grotesk'] overflow-x-hidden flex flex-col">
                    <NavbarDonador />
                    <main id="main-content" className="flex-grow" tabIndex={-1}>
                      <React.Suspense
                        fallback={
                          <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
                            <div className="w-10 h-10 border-4 border-[#07c4e1] border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-[#004955] text-sm font-medium">Cargando...</p>
                          </div>
                        }
                      >
                        <Outlet />
                      </React.Suspense>
                    </main>
                    <Footer />
                    <ManadaFloatingBar />
                    <Toaster position="bottom-right" richColors />
                  </div>
                  </PagoProvider>
                </FavoritosProvider>
              </NotificationProvider>
            </FoundationProvider>
          </AdminProvider>
        </SubscriptionProvider>
      </ManadaProvider>
    </AuthProvider>
  );
}
