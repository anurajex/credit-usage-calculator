
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import Dashboard from './Dashboard';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  return <Dashboard />;
};

export default Index;
