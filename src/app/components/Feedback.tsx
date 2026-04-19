import { useState, useEffect } from 'react';
import { MessageSquare, Send, Star, ThumbsUp, ThumbsDown, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  category: string;
  rating: number;
  title: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
}

const CATEGORIES = [
  'General Feedback',
  'Bug Report',
  'Feature Request',
  'User Interface',
  'Performance',
  'Documentation',
  'Other'
];

const RATINGS = [1, 2, 3, 4, 5];

export function Feedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [newFeedback, setNewFeedback] = useState({
    category: 'General Feedback',
    rating: 5,
    title: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  useEffect(() => {
    // Load feedbacks from localStorage
    const storedFeedbacks = localStorage.getItem('dts_feedbacks');
    if (storedFeedbacks) {
      const parsed = JSON.parse(storedFeedbacks);
      setFeedbacks(parsed.map((f: any) => ({
        ...f,
        timestamp: new Date(f.timestamp)
      })));
    } else {
      // Load mock feedbacks
      const mockFeedbacks: FeedbackItem[] = [
        {
          id: '1',
          userId: '2',
          userName: 'Prof. James Omondi',
          userRole: 'Programme Lead',
          category: 'User Interface',
          rating: 4,
          title: 'Dashboard improvements needed',
          message: 'The dashboard is great but could use more interactive charts and real-time updates. The color scheme could be more accessible for users with visual impairments.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'reviewed',
          adminResponse: 'Thank you for your feedback! We\'re working on improving the dashboard accessibility and adding real-time features.'
        },
        {
          id: '2',
          userId: '3',
          userName: 'Mary Wanjiku',
          userRole: 'Group Leader',
          category: 'Feature Request',
          rating: 5,
          title: 'Add bulk operations',
          message: 'Would be great to have bulk operations for marking attendance and updating multiple courses at once. This would save a lot of time for group leaders.',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'pending'
        },
        {
          id: '3',
          userId: '4',
          userName: 'Grace Akinyi',
          userRole: 'Viewer/Digitiser',
          category: 'Performance',
          rating: 3,
          title: 'Slow loading times',
          message: 'The reports page takes a long time to load, especially when there are many courses. Sometimes it times out completely.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'resolved',
          adminResponse: 'Performance issues have been addressed in the latest update. Please let us know if you continue to experience slow loading.'
        }
      ];
      setFeedbacks(mockFeedbacks);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.title.trim() || !newFeedback.message.trim()) return;

    setIsSubmitting(true);
    
    const feedback: FeedbackItem = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Anonymous User',
      userRole: user?.role || 'Unknown',
      category: newFeedback.category,
      rating: newFeedback.rating,
      title: newFeedback.title.trim(),
      message: newFeedback.message.trim(),
      timestamp: new Date(),
      status: 'pending'
    };

    // Save to localStorage
    const updatedFeedbacks = [feedback, ...feedbacks];
    setFeedbacks(updatedFeedbacks);
    localStorage.setItem('dts_feedbacks', JSON.stringify(updatedFeedbacks));

    // Reset form
    setNewFeedback({
      category: 'General Feedback',
      rating: 5,
      title: '',
      message: ''
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setIsSubmitting(false);
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    filter === 'all' || f.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'reviewed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <AlertCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback & Support</h1>
          <p className="text-muted-foreground">Share your thoughts and help us improve the system</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Feedback: {feedbacks.length}
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-card rounded-xl p-6 border border-shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Submit Your Feedback
        </h2>
        
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Thank you! Your feedback has been submitted successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Category</label>
              <select
                value={newFeedback.category}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Rating</label>
              <div className="flex gap-2">
                {RATINGS.map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewFeedback(prev => ({ ...prev, rating }))}
                    className={`p-2 rounded-lg transition-all ${
                      rating <= newFeedback.rating
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${rating <= newFeedback.rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Title</label>
            <input
              type="text"
              value={newFeedback.title}
              onChange={(e) => setNewFeedback(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of your feedback"
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Detailed Feedback</label>
            <textarea
              value={newFeedback.message}
              onChange={(e) => setNewFeedback(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please provide detailed feedback, suggestions, or describe any issues you've encountered..."
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setNewFeedback({
                category: 'General Feedback',
                rating: 5,
                title: '',
                message: ''
              })}
              className="px-6 py-3 rounded-lg border border-border hover:bg-muted transition-all"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newFeedback.title.trim() || !newFeedback.message.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Feedback List */}
      <div className="bg-card rounded-xl p-6 border border-shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Recent Feedback
          </h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'reviewed', 'resolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No feedback found</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="p-4 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                      {feedback.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{feedback.userName}</div>
                      <div className="text-sm text-muted-foreground">{feedback.userRole}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feedback.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(feedback.status)}
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </div>
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < feedback.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="font-medium mb-1">{feedback.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">{feedback.category}</div>
                  <p className="text-sm">{feedback.message}</p>
                </div>

                {feedback.adminResponse && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">Admin Response:</div>
                    <p className="text-sm text-blue-700">{feedback.adminResponse}</p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    {feedback.timestamp.toLocaleDateString()} at {feedback.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      Helpful
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      Not Helpful
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
