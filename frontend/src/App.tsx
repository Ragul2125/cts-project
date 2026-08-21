import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { PatientProvider, usePatient } from './context/PatientContext';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';

// Landing & Auth Components
import SplashScreen from './components/landing/SplashScreen';
import PageLoader from './components/landing/PageLoader';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import PatientRegistration from './pages/Auth/PatientRegistration';
import HospitalRegistration from './pages/Auth/HospitalRegistration';
import HospitalDashboard from './pages/Auth/HospitalDashboard';
import CMSDashboard from './pages/Auth/CMSDashboard';

// Patient Portal Pages
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { MedicalFilesPage } from './pages/MedicalFiles/MedicalFilesPage';
import { AssessmentPage } from './pages/Assessment/AssessmentPage';
import { CareNavigationPage } from './pages/CareNavigation/CareNavigationPage';
import { CarePlanPage } from './pages/CarePlan/CarePlanPage';
import { TelehealthPage } from './pages/Telehealth/TelehealthPage';
import { HistoryPage } from './pages/History/HistoryPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { HelpPage } from './pages/Help/HelpPage';
import { NotFoundPage } from './pages/NotFound/NotFoundPage';

const AppRoutes: React.FC = () => {
  const { isAssessmentOpen } = useAssessment();
  const { session, login, logout, registerPatient, registerHospital } = useAuthContext();
  const { updatePatient, refreshBackendData } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  const [navLoading, setNavLoading] = useState(false);

  // Automatically scroll to top of page on route change
  useEffect(() => {
    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      mainWrapper.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const transitionTo = (path: string) => {
    setNavLoading(true);
    setTimeout(() => {
      navigate(path);
      setNavLoading(false);
    }, 350);
  };

  const handleLogin = async (credentials: { role?: string; identifier: string; password: string }, rememberMe?: boolean) => {
    const res = await login(credentials, rememberMe);
    if (res.ok) {
      if (res.role === 'patient') {
        const memberId = res.session?.memberId || '204';
        if (res.session) {
          updatePatient({
            name: res.session.name,
            displayId: memberId,
            email: res.session.email || 'patient204@example.com'
          });
        }
        await refreshBackendData(memberId).catch(() => null);
        transitionTo('/dashboard');
      } else if (res.role === 'cms') {
        transitionTo('/cms-dashboard');
      } else {
        transitionTo('/hospital-dashboard');
      }
    }
    return res;
  };

  const handlePatientRegister = async (data: any) => {
    const res = await registerPatient(data);
    if (res.ok && res.user) {
      updatePatient({
        name: res.user.fullName,
        displayId: res.user.memberId,
        email: res.user.email,
        phone: res.user.mobile,
        dob: res.user.dob
      });
      // Also automatically log in as the newly registered patient
      await login({ identifier: data.memberId, password: data.password }, true);
      await refreshBackendData(data.memberId).catch(() => null);
    }
    return res;
  };

  return (
    <>
      <PageLoader visible={navLoading} />

      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage onGetStarted={() => transitionTo('/login')} />} />
        <Route path="/landing" element={<LandingPage onGetStarted={() => transitionTo('/login')} />} />

        {/* Authentication Pages */}
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
              onPatientRegister={() => transitionTo('/patient-register')}
              onHospitalRegister={() => transitionTo('/hospital-register')}
              onBack={() => transitionTo('/')}
            />
          }
        />

        <Route
          path="/patient-register"
          element={
            <PatientRegistration
              onBack={() => transitionTo('/login')}
              onRegister={handlePatientRegister}
            />
          }
        />

        <Route
          path="/hospital-register"
          element={
            <HospitalRegistration
              onBack={() => transitionTo('/login')}
              onRegister={(data: any) => registerHospital(data)}
            />
          }
        />

        <Route
          path="/hospital-dashboard"
          element={
            <HospitalDashboard
              session={session}
              onLogout={() => {
                logout();
                transitionTo('/');
              }}
            />
          }
        />

        <Route
          path="/cms-dashboard"
          element={
            <CMSDashboard
              session={session}
              onLogout={() => {
                logout();
                transitionTo('/');
              }}
            />
          }
        />

        <Route
          path="/admin"
          element={
            <CMSDashboard
              session={session}
              onLogout={() => {
                logout();
                transitionTo('/');
              }}
            />
          }
        />

        {/* In-Place Assessment Standalone Fallbacks */}
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/step-1" element={<AssessmentPage />} />
        <Route path="/assessment/step-2" element={<AssessmentPage />} />
        <Route path="/assessment/step-3" element={<AssessmentPage />} />
        <Route path="/assessment/step-4" element={<AssessmentPage />} />
        <Route path="/assessment/step-5" element={<AssessmentPage />} />

        {/* Main CareNexus Patient Portal Layout Pages */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/files" element={<MedicalFilesPage />} />
          <Route path="/care-navigation" element={<CareNavigationPage />} />
          <Route path="/care-plan" element={<CarePlanPage />} />
          <Route path="/telehealth" element={<TelehealthPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>

      {/* Global In-Place Assessment Popup Modal */}
      {isAssessmentOpen && <AssessmentPage />}
    </>
  );
};

export const App: React.FC = () => {
  const [splashDone, setSplashDone] = useState<boolean>(() => {
    // Only show splash screen once per browser session
    return Boolean(sessionStorage.getItem('cts_splash_done'));
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('cts_splash_done', 'true');
    setSplashDone(true);
  };

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <PatientProvider>
        <AssessmentProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AssessmentProvider>
      </PatientProvider>
    </AuthProvider>
  );
};

export default App;
