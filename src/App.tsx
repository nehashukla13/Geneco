import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Leaf, Recycle, AlertTriangle, Factory, Trash2, Upload, LogOut, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { ThemeToggle } from './components/ui/theme-toggle';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/Auth';
import { CommunityPage } from './pages/Community';
import { ImageUpload } from './components/waste/ImageUpload';
import { WasteHistory } from './components/waste/WasteHistory';
import { CarbonStats } from './components/waste/CarbonStats';

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

const ecoQuotes = [
  "Every waste properly managed is a gift to future generations.",
  "Small actions, when multiplied by millions, can transform the world.",
  "The greatest threat to our planet is the belief that someone else will save it.",
  "Waste isn't waste until we waste it."
];

function Dashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'upload' | 'history' | 'stats'>('upload');
  const [quote, setQuote] = React.useState(ecoQuotes[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuote(prev => {
        const currentIndex = ecoQuotes.indexOf(prev);
        return ecoQuotes[(currentIndex + 1) % ecoQuotes.length];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card shadow-sm glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="animate-gradient p-2 rounded-full">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">Geneco</h1>
            </motion.div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => window.location.href = '/community'}
                className="flex items-center space-x-2 hover-card"
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </Button>
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" onClick={signOut} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Quote */}
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-card-foreground mb-4">
            AI-Powered Waste Management
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="eco-quote"
            >
              {quote}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button
            variant={activeTab === 'upload' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('upload')}
            className="flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Image</span>
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            View History
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('stats')}
            className="flex items-center space-x-2"
          >
            <Leaf className="h-5 w-5" />
            <span>Carbon Stats</span>
          </Button>
        </div>

        {/* Content Sections */}
        <div className="bg-card rounded-xl shadow-md p-8 mb-12">
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-semibold mb-4">Smart Waste Classification</h3>
                <p className="text-muted-foreground mb-6">
                  Upload an image of your waste and let our AI classify it instantly.
                  Get personalized recommendations for proper disposal and recycling.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-6">
                <ImageUpload />
              </div>
            </div>
          )}
          
          {activeTab === 'history' && <WasteHistory />}
          {activeTab === 'stats' && <CarbonStats />}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Waste Categories</h3>
            <p className="text-muted-foreground">
              Our AI system accurately classifies waste into recyclable, hazardous, organic, 
              non-recyclable, and industrial categories.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-muted-foreground">
              Get personalized recommendations for proper waste disposal and recycling 
              based on AI analysis.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Factory className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Monitor your waste management history and see how you're contributing to 
              a more sustainable future.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;