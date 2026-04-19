import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, Users, Target, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const { participants, courses } = useData();
  const [animatedCount, setAnimatedCount] = useState(0);
  const totalModules = courses.reduce((sum, course) => sum + course.totalModules, 0);
  const completedModules = courses.reduce((sum, course) => sum + course.completedModules, 0);
  const actualProgress = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;
  const isWorkshopComplete = actualProgress >= 100;

  useEffect(() => {
    if (isWorkshopComplete) {
      // Workshop complete - stay at 100%
      setAnimatedCount(100);
      return;
    }

    // Continuous animation: actualProgress -> 100 -> actualProgress
    const cycleDuration = 6000; // 6 seconds per full cycle
    const fps = 60;
    const frameTime = 1000 / fps;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % cycleDuration) / cycleDuration;

      let currentValue;
      if (progress < 0.5) {
        // First half: animate from actualProgress to 100
        const t = progress * 2; // 0 to 1
        currentValue = actualProgress + (100 - actualProgress) * easeInOutCubic(t);
      } else {
        // Second half: animate from 100 back to actualProgress
        const t = (progress - 0.5) * 2; // 0 to 1
        currentValue = 100 - (100 - actualProgress) * easeInOutCubic(t);
      }

      setAnimatedCount(Math.round(currentValue));
    };

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const timer = setInterval(animate, frameTime);
    animate(); // Initial call

    return () => clearInterval(timer);
  }, [actualProgress, isWorkshopComplete]);

  const metrics = [
    { label: 'Courses Digitised', value: courses.filter((course) => course.completedModules === course.totalModules).length, icon: BookOpen, color: 'from-primary to-primary/60' },
    { label: 'Total Modules', value: totalModules, icon: Target, color: 'from-secondary to-secondary/60' },
    { label: 'Active Participants', value: participants.length, icon: Users, color: 'from-chart-3 to-chart-3/60' },
    { label: 'Completion Rate', value: `${actualProgress}%`, icon: TrendingUp, color: 'from-chart-4 to-chart-4/60' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2942] to-[#0d1f35] text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute ${i % 2 === 0 ? 'text-[#037b90]' : 'text-[#ff7f50]'}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {i % 3 === 0 ? '⭐' : i % 3 === 1 ? '◆' : '✦'}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center gap-4">
            <img
              src="https://ouk.ac.ke/sites/default/files/gallery/logo_footer.png"
              alt="OUK"
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-2xl">Open University of Kenya</h1>
              <p className="text-sm text-white/60">Digital Transformation Initiative</p>
            </div>
          </div>
          <motion.button
            onClick={onLoginClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
          >
            Sign In
          </motion.button>
        </motion.div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-6xl mb-4 bg-gradient-to-r from-[#037b90] via-[#ff7f50] to-[#037b90] bg-clip-text text-transparent">
              Digitisation Tracking System
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Transforming education through digital innovation. Track, manage, and optimize the digitisation of academic content in real-time.
            </p>
          </motion.div>

          {/* Large animated percentage */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative inline-block mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#037b90] to-[#ff7f50] opacity-20 blur-3xl rounded-full" />
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl px-16 py-12 shadow-2xl">
              <motion.div
                className="text-9xl font-bold bg-gradient-to-r from-[#037b90] to-[#ff7f50] bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {animatedCount}%
              </motion.div>
              <div className="text-lg text-white/60 mt-2">
                {isWorkshopComplete ? 'Workshop Complete! 🎉' : 'Overall Progress'}
              </div>
              {!isWorkshopComplete && (
                <>
                  <div className="text-sm text-white/40 mt-2">
                    Current: {actualProgress}% • Target: 100%
                  </div>
                  <div className="mt-4 w-64 mx-auto">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#037b90] to-[#ff7f50]"
                        animate={{ width: `${animatedCount}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8 text-white/60" />
                    <Sparkles className="w-5 h-5 text-[#ff7f50] animate-pulse" />
                  </div>
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {metric.value}
                  </motion.div>
                  <div className="text-sm text-white/60">{metric.label}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl"
        >
          <h3 className="text-3xl mb-8 text-center">Comprehensive Workshop Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-lg mb-2">Course Tracking</h4>
              <p className="text-sm text-white/60">Monitor digitisation progress across all courses and modules in real-time</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary to-secondary/60 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-lg mb-2">Team Management</h4>
              <p className="text-sm text-white/60">Organize participants across groups with role-based access control</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-chart-3 to-chart-3/60 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-lg mb-2">Analytics Dashboard</h4>
              <p className="text-sm text-white/60">Track attendance, payments, and progress with comprehensive analytics</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center mt-16 text-white/40 text-sm"
        >
          <p>© 2026 Open University of Kenya. Digital Transformation Initiative.</p>
        </motion.div>
      </div>
    </div>
  );
}
