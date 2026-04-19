import { MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Comments() {
  const { user } = useAuth();
  const canManage = user?.role === 'System Admin' || user?.role === 'Programme Lead';

  if (!canManage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access Comments management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Comments Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and review user comments across all modules
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Comments Section</h3>
          <p className="mb-4">
            This section allows administrators to manage user comments, feedback, and reviews 
            across all system modules. Features include comment moderation, response management, 
            and analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
