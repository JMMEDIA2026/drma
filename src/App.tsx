import React from 'react';
import { X } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ReelsPlayerView } from './components/ReelsPlayerView';
import { MembershipView } from './components/MembershipView';
import { StorageView } from './components/StorageView';
import { MyPageView } from './components/MyPageView';
import { DramaDetailSheet } from './components/DramaDetailSheet';
import { SearchModal } from './components/SearchModal';
import { ShareModal } from './components/ShareModal';
import { RatingModal } from './components/RatingModal';
import { AuthView } from './components/AuthView';
import { AdminView } from './components/AdminView';
import { LanguageModal } from './components/LanguageModal';

const MainContent: React.FC = () => {
  const { activeTab, toastMessage, isAuthenticated, authViewOpen, setAuthViewOpen } = useApp();

  return (
    <div className="min-h-screen bg-[#101014] text-zinc-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Navbar is displayed on Home view */}
      {activeTab === 'home' && <Navbar />}

      {/* Main Tab Screen Switcher */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'reels' && <ReelsPlayerView />}
        {activeTab === 'membership' && <MembershipView />}
        {activeTab === 'storage' && isAuthenticated && <StorageView />}
        {activeTab === 'mypage' && isAuthenticated && <MyPageView />}
      </main>

      {/* Global Bottom Navigation */}
      <BottomNav />

      {/* Modals & Overlays */}
      <DramaDetailSheet />
      <SearchModal />
      <ShareModal />
      <RatingModal />
      <AdminView />
      <LanguageModal />

      {/* Login/signup overlay — opened on demand (e.g. from 보관함/마이페이지
          for guests) instead of blocking the whole app before auth */}
      {authViewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-[#161620] rounded-3xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              id="btn-close-auth-view"
              onClick={() => setAuthViewOpen(false)}
              className="absolute top-3.5 left-3.5 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <AuthView />
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#22222E]/95 border border-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
      <SpeedInsights />
    </AppProvider>
  );
}
