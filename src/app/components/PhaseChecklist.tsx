import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, X, Save, Rocket, Flag } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ChecklistItem } from '../data/checklistData';

export function PhaseChecklist() {
  const { user } = useAuth();
  const { checklistItems, updateChecklistItem, setChecklistItems } = useData();
  const [adding, setAdding] = useState<{ category: 'pre-flight' | 'close-out' } | null>(null);
  const [newForm, setNewForm] = useState({ title: '', description: '' });

  const canEdit = user?.role !== 'Viewer/Digitiser';
  const { success, error, warning } = useToast();

  const toggle = (id: string) => {
    const item = checklistItems.find(i => i.id === id);
    if (item) updateChecklistItem({ ...item, isComplete: !item.isComplete });
  };

  const deleteItem = (id: string) => {
    const item = checklistItems.find(i => i.id === id);
    if (confirm('Delete this checklist item?')) {
      setChecklistItems(checklistItems.filter(i => i.id !== id));
      warning(`"${item?.title ?? 'Item'}" has been removed from the checklist.`, 'Item Deleted');
    }
  };

  const addItem = () => {
    if (!newForm.title) { error('A task title is required before adding.', 'Validation Error'); return; }
    const item: ChecklistItem = {
      id: `item-${Date.now()}`,
      title: newForm.title,
      description: newForm.description,
      isComplete: false,
      category: adding!.category,
    };
    setChecklistItems([...checklistItems, item]);
    setAdding(null);
    setNewForm({ title: '', description: '' });
    success(`"${item.title}" added to the ${adding!.category === 'pre-flight' ? 'Pre-Flight' : 'Close-Out'} checklist.`, 'Task Added');
  };

  const preItems = checklistItems.filter(i => i.category === 'pre-flight');
  const closeItems = checklistItems.filter(i => i.category === 'close-out');
  const preProgress = preItems.length ? Math.round(preItems.filter(i => i.isComplete).length / preItems.length * 100) : 0;
  const closeProgress = closeItems.length ? Math.round(closeItems.filter(i => i.isComplete).length / closeItems.length * 100) : 0;

  const Section = ({ title, subtitle, icon: Icon, items, category, progress, color }:
    { title: string; subtitle: string; icon: React.ElementType; items: ChecklistItem[]; category: 'pre-flight' | 'close-out'; progress: number; color: string }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-8 h-8" />
            <div><h2 className="text-2xl">{title}</h2><p className="text-white/80">{subtitle}</p></div>
          </div>
          <div className="text-right"><div className="text-5xl font-bold">{progress}%</div><div className="text-sm text-white/80">Complete</div></div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="p-6 space-y-3">
        {items.map(item => (
          <div key={item.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${item.isComplete ? 'bg-chart-3/5 border-chart-3/20' : 'bg-muted/30 border-border hover:bg-muted/50'}`}>
            <button onClick={() => canEdit && toggle(item.id)} className="mt-1 flex-shrink-0">
              {item.isComplete ? <CheckCircle2 className="w-6 h-6 text-chart-3" /> : <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />}
            </button>
            <div className="flex-1">
              <div className={`font-medium mb-1 ${item.isComplete ? 'line-through text-muted-foreground' : ''}`}>{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.description}</div>
            </div>
            {canEdit && (
              <button onClick={() => deleteItem(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {canEdit && (
          <button onClick={() => setAdding({ category })}
            className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl mb-2">Phase Checklist</h1>
        <p className="text-muted-foreground">Track workshop preparation and close-out tasks</p>
      </div>

      <Section title="Pre-Flight (Before)" subtitle="Workshop preparation tasks" icon={Rocket}
        items={preItems} category="pre-flight" progress={preProgress} color="from-primary to-primary/80" />
      <Section title="Close-Out (After)" subtitle="Post-workshop documentation" icon={Flag}
        items={closeItems} category="close-out" progress={closeProgress} color="from-secondary to-secondary/80" />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tasks', value: checklistItems.length, color: '' },
          { label: 'Completed', value: checklistItems.filter(i => i.isComplete).length, color: 'text-chart-3' },
          { label: 'Remaining', value: checklistItems.filter(i => !i.isComplete).length, color: 'text-chart-4' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl p-6 border border-border">
            <div className="text-sm text-muted-foreground mb-2">{label}</div>
            <div className={`text-3xl ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setAdding(null)}>
          <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl">Add {adding.category === 'pre-flight' ? 'Pre-Flight' : 'Close-Out'} Task</h2>
              <button onClick={() => setAdding(null)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-muted-foreground">Task Title</label>
                <input type="text" value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter task title..."
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block mb-1 text-sm text-muted-foreground">Description</label>
                <input type="text" value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description..."
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setAdding(null)} className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80">Cancel</button>
              <button onClick={addItem} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
