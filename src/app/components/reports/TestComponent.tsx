import { useAuth } from '../../contexts/AuthContext';

export function TestComponent() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports Test Component</h1>
      <p className="text-muted-foreground">Testing Reports module functionality</p>
      <p>User: {user?.name || 'Not logged in'}</p>
      <p>Role: {user?.role || 'No role'}</p>
    </div>
  );
}
