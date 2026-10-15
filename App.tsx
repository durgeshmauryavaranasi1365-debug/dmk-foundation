import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { QuickRoleSwitcher } from './components/common/QuickRoleSwitcher';
import { WhatsAppFloat } from './components/common/WhatsAppFloat';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { LegalPages } from './components/public/LegalPages';
import { ProductDetailPage } from './components/public/ProductDetailPage';
import { LoanProductsGrid } from './components/public/LoanProductsGrid';
import { EMICalculatorWidget } from './components/public/EMICalculatorWidget';
import { EligibilityCheckerWidget } from './components/public/EligibilityCheckerWidget';
import { ApplicationTracker } from './components/public/ApplicationTracker';
import { AuthPages } from './components/public/AuthPages';
import { LoanApplyWizard } from './components/customer/LoanApplyWizard';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';

function AppContent() {
  const { currentUser } = useApp();

  // Simple, robust client-side route manager using pathname and query
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [queryParams, setQueryParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(window.location.search);
  });

  // Listen to browser navigation popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setQueryParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    const [pathPart, queryPart] = path.split('?');
    window.history.pushState({}, '', path);
    setCurrentPath(pathPart || '/');
    setQueryParams(new URLSearchParams(queryPart || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderRoute = () => {
    // 1. Customer Portal routes
    if (currentPath.startsWith('/customer/')) {
      const tab = currentPath.replace('/customer/', '').replace('-schedule', '');
      return <CustomerPortal initialTab={tab || 'dashboard'} navigate={navigate} />;
    }

    // 2. Admin Portal routes
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      if (currentPath === '/admin/login') {
        return <AuthPages mode="admin-login" navigate={navigate} />;
      }
      // Protected admin routes cannot be opened without authentication
      const isStaffOrAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff');
      if (!isStaffOrAdmin) {
        return <AuthPages mode="admin-login" navigate={navigate} unauthorizedAttempt={true} />;
      }
      const rawTab = currentPath === '/admin' ? 'dashboard' : currentPath.replace('/admin/', '').replace('-logs', '');
      const tab = rawTab === 'profile' ? 'settings' : (rawTab || 'dashboard');
      return <AdminPortal initialTab={tab} navigate={navigate} />;
    }

    // 3. Auth routes
    if (currentPath === '/login') {
      return <AuthPages mode="login" navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <AuthPages mode="register" navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <AuthPages mode="forgot" navigate={navigate} />;
    }

    // 4. Public main pages
    if (currentPath === '/') {
      return <HomePage navigate={navigate} />;
    }
    if (currentPath === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (currentPath === '/loans') {
      return (
        <div className="py-12 bg-slate-950">
          <LoanProductsGrid navigate={navigate} />
        </div>
      );
    }
    if (currentPath === '/emi-calculator') {
      return (
        <div className="py-16 bg-slate-950 px-4 max-w-7xl mx-auto">
          <EMICalculatorWidget navigate={navigate} showScheduleByDefault={true} />
        </div>
      );
    }
    if (currentPath === '/eligibility') {
      return <EligibilityCheckerWidget navigate={navigate} />;
    }
    if (currentPath === '/track-application') {
      return <ApplicationTracker navigate={navigate} />;
    }
    if (currentPath === '/apply') {
      const type = queryParams.get('type') || undefined;
      const amount = queryParams.get('amount') ? Number(queryParams.get('amount')) : undefined;
      const tenure = queryParams.get('tenure') ? Number(queryParams.get('tenure')) : undefined;
      return (
        <div className="py-12 bg-slate-950">
          <LoanApplyWizard
            navigate={navigate}
            initialType={type}
            initialAmount={amount}
            initialTenure={tenure}
          />
        </div>
      );
    }

    // 5. Individual Product pages
    const productSlugs = [
      'personal-loan',
      'business-loan',
      'msme-loan',
      'education-loan',
      'home-loan',
      'vehicle-loan',
    ];
    const matchedSlug = productSlugs.find((slug) => currentPath === `/${slug}`);
    if (matchedSlug) {
      return <ProductDetailPage slug={matchedSlug} navigate={navigate} />;
    }

    // 6. Legal & Compliance pages
    if (currentPath === '/privacy-policy') {
      return <LegalPages type="privacy" navigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <LegalPages type="terms" navigate={navigate} />;
    }
    if (currentPath === '/grievance') {
      return <LegalPages type="grievance" navigate={navigate} />;
    }
    if (currentPath === '/disclaimer') {
      return <LegalPages type="disclaimer" navigate={navigate} />;
    }

    // Fallback: Default to Home Page
    return <HomePage navigate={navigate} />;
  };

  const isPortalView =
    currentPath.startsWith('/customer/') ||
    ((currentPath === '/admin' || currentPath.startsWith('/admin/')) && currentPath !== '/admin/login');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Demo Bar (Always accessible to switch personas) */}
      <QuickRoleSwitcher />

      {/* Main Header (Visible unless inside deep portal view, which has full sidebar) */}
      {!isPortalView && <Header currentPath={currentPath} navigate={navigate} />}

      {/* Main Content Router */}
      <div className="flex-1">
        {renderRoute()}
      </div>

      {/* Footer on public pages */}
      {!isPortalView && <Footer navigate={navigate} />}

      {/* Floating WhatsApp Button */}
      <WhatsAppFloat />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
