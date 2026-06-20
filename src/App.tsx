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
import { seedMatchHistory } from './utils/seedData';

const MainApp = () => {
  const { user, hasCompletedOnboarding } = useUser();
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
          <MatchHistory history={seedMatchHistory} />
        </div>
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
