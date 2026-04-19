import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from './ImageWithFallback';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onBackToHome?: () => void;
}

export function Login({ onBackToHome }: LoginProps = {}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(identifier.trim(), password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative">
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      )}
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border/50">
          <div className="flex flex-col items-center mb-8">
            <ImageWithFallback
              src="https://ouk.ac.ke/sites/default/files/gallery/logo_footer.png"
              alt="OUK Logo"
              className="h-24 w-auto mb-6"
            />
            <h1 className="text-3xl text-center text-foreground mb-2">
              Digitisation Tracking System
            </h1>
            <p className="text-muted-foreground text-center">Open University of Kenya</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block mb-2 text-foreground">
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="admin or admin@ouk.ac.ke"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>

            <div className="text-sm text-muted-foreground text-center">
              Use admin/admin123, plead/plead123, gleader/gleader123 or viewer/viewer123
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
