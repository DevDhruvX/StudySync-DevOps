import { motion } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  FileText,
  Clock,
  Target,
  Flame,
  Calendar,
  Award
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface User {
  stats?: {
    loginStreak?: number;
  };
}

interface Subject {
  name: string;
  color: string;
  notesCount?: number;
}

interface AnalyticsDashboardProps {
  user: User;
  subjects: Subject[];
}

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ user, subjects }) => {
  // Sample data - in a real app, this would come from your backend
  const weeklyActivity = [
    { day: 'Mon', notes: 4, time: 2.5 },
    { day: 'Tue', notes: 6, time: 3.2 },
    { day: 'Wed', notes: 3, time: 1.8 },
    { day: 'Thu', notes: 8, time: 4.1 },
    { day: 'Fri', notes: 5, time: 2.9 },
    { day: 'Sat', notes: 7, time: 3.5 },
    { day: 'Sun', notes: 2, time: 1.2 }
  ];

  const subjectDistribution = subjects.map((subject, index) => ({
    name: subject.name,
    value: subject.notesCount || Math.floor(Math.random() * 20) + 1,
    color: subject.color || `hsl(${index * 137.5}, 70%, 60%)`
  }));

  const studyStreakData = [
    { week: 'Week 1', streak: 3 },
    { week: 'Week 2', streak: 5 },
    { week: 'Week 3', streak: 2 },
    { week: 'Week 4', streak: 7 },
    { week: 'Week 5', streak: 4 },
    { week: 'Week 6', streak: 6 }
  ];

  const totalNotes = subjects.reduce((total, subject) => total + (subject.notesCount || 0), 0);
  const totalTime = weeklyActivity.reduce((total, day) => total + day.time, 0);
  const currentStreak = user?.stats?.loginStreak || 5;
  const avgNotesPerDay = (totalNotes / 7).toFixed(1);

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }: StatCardProps) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-xl bg-${color}-500/20`}>
          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${color}-400`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-${trend > 0 ? 'green' : 'red'}-400 text-xs sm:text-sm`}>
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/60 text-xs sm:text-sm">{title}</div>
      {subtitle && <div className="text-white/40 text-xs mt-1">{subtitle}</div>}
    </motion.div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Quick Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <StatCard
          icon={BookOpen}
          title="Total Subjects"
          value={subjects.length}
          subtitle="Active subjects"
          trend={12}
          color="blue"
        />
        <StatCard
          icon={FileText}
          title="Total Notes"
          value={totalNotes}
          subtitle={`${avgNotesPerDay} per day`}
          trend={8}
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Study Hours"
          value={`${totalTime.toFixed(1)}h`}
          subtitle="This week"
          trend={5}
          color="purple"
        />
        <StatCard
          icon={Flame}
          title="Study Streak"
          value={`${currentStreak} days`}
          subtitle="Keep it up!"
          trend={15}
          color="orange"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Weekly Activity</h3>
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
                <span className="text-white/70">Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <span className="text-white/70">Hours</span>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="notes"
                stackId="1"
                stroke="#A855F7"
                fill="rgba(168,85,247,0.3)"
              />
              <Area
                type="monotone"
                dataKey="time"
                stackId="2"
                stroke="#3B82F6"
                fill="rgba(59,130,246,0.3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Subject Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Subject Distribution</h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={subjectDistribution}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {subjectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="mt-4 space-y-2">
            {subjectDistribution.slice(0, 4).map((subject, index) => (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                    style={{ backgroundColor: subject.color }}
                  ></div>
                  <span className="text-white/70 truncate max-w-[80px] sm:max-w-[120px]">{subject.name}</span>
                </div>
                <span className="text-white font-medium">{subject.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        
        {/* Study Streak Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Study Streak Progress</h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={studyStreakData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="streak" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Achievement Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Recent Achievements</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-xl">
              <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-white font-medium text-sm sm:text-base">7-Day Streak!</div>
                <div className="text-white/60 text-xs sm:text-sm">Consistent daily studying</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-xl">
              <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              </div>
              <div>
                <div className="text-white font-medium text-sm sm:text-base">50 Notes Milestone</div>
                <div className="text-white/60 text-xs sm:text-sm">Knowledge building master</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/5 rounded-xl">
              <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium text-sm sm:text-base">Weekly Goal Achieved</div>
                <div className="text-white/60 text-xs sm:text-sm">20+ hours of focused study</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;