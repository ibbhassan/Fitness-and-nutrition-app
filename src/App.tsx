import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { WorkoutLogger } from './pages/WorkoutLogger';
import { Nutrition } from './pages/Nutrition';
import { BiometricsTab } from './pages/BiometricsTab';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { MatchHistory } from './components/MatchHistory';
import { Onboarding } from './pages/Onboarding';
import { Auth } from './pages/Auth';
import { UserProvider, useUser } from './context/UserContext';
import { PatchNotesModal } from './components/PatchNotesModal';

const CURRENT_VERSION = 'v1.1.0';

const MainApp = () => {
  const { user, hasCompletedOnboarding, profile, markPatchNotesSeen } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Auth />;
  }

  if (!hasCompletedOnboarding) {
    return <Onboarding />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'workout' && <WorkoutLogger />}
      {activeTab === 'nutrition' && <Nutrition />}
      { activeTab === 'biometrics' && <BiometricsTab /> }
      { activeTab === 'analytics' && <Analytics /> }
      { activeTab === 'profile' && <Profile /> }
      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto fade-in space-y-6">
          <MatchHistory />
        </div>
      )}
      {profile?.lastSeenPatchVersion !== CURRENT_VERSION && activeTab === 'dashboard' && (
        <PatchNotesModal 
          version={CURRENT_VERSION} 
          onClose={() => markPatchNotesSeen(CURRENT_VERSION)} 
        />
      )}
    </Layout>
  );
};

function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

export default App;
