import { useAuth } from '../contexts/AuthContext';

export function ReportsSimple() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Please Login</h2>
          <p className="text-muted-foreground">You need to be logged in to access the Reports module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold mb-1">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Hello {user?.name || 'User'}, welcome to the Reports module.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Reports Module</h2>
        <p className="text-muted-foreground mb-4">
          This is the main Reports module with hierarchical navigation similar to Moodle's interface.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">📋 Logs</h3>
            <p className="text-sm text-muted-foreground">System activity logs and event tracking</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">💬 Comments</h3>
            <p className="text-sm text-muted-foreground">Manage and review user comments</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">💾 Backups</h3>
            <p className="text-sm text-muted-foreground">View and manage system backups</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">📊 Insights</h3>
            <p className="text-sm text-muted-foreground">Analytics and performance insights</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">⚡ Performance</h3>
            <p className="text-sm text-muted-foreground">System performance metrics and monitoring</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">🛡️ Security</h3>
            <p className="text-sm text-muted-foreground">Security audit and compliance checks</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">🖥️ Status</h3>
            <p className="text-sm text-muted-foreground">Current system status and health</p>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <h3 className="text-lg font-semibold mb-2">⚙️ Monitoring</h3>
            <p className="text-sm text-muted-foreground">Configure event monitoring and alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
