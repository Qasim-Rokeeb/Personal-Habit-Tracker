import React, { useState, useMemo } from 'react';
import { Plus, Calendar, TrendingUp, Award, Trash2, CheckCircle2, Circle, BarChart3 } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: 'Read for 30 minutes', color: '#3B82F6', streak: 7, completions: {} },
    { id: 2, name: 'Exercise', color: '#10B981', streak: 3, completions: {} },
    { id: 3, name: 'Meditate', color: '#8B5CF6', streak: 12, completions: {} }
  ]);
  const [newHabit, setNewHabit] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [view, setView] = useState('dashboard');
  const [selectedHabit, setSelectedHabit] = useState(null);

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (dateKey) => {
    return dateKey === getDateKey(new Date());
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit = {
        id: Date.now(),
        name: newHabit.trim(),
        color: selectedColor,
        streak: 0,
        completions: {}
      };
      setHabits([...habits, habit]);
      setNewHabit('');
    }
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleCompletion = (habitId, date = new Date()) => {
    const dateKey = getDateKey(date);
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newCompletions = { ...habit.completions };
        if (newCompletions[dateKey]) {
          delete newCompletions[dateKey];
        } else {
          newCompletions[dateKey] = true;
        }
        
        // Calculate new streak
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const checkKey = getDateKey(checkDate);
          
          if (newCompletions[checkKey]) {
            streak++;
          } else {
            break;
          }
        }
        
        return { ...habit, completions: newCompletions, streak };
      }
      return habit;
    }));
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: getDateKey(date),
        day: date.getDate(),
        dayName: date.toLocaleDateString('en', { weekday: 'short' })
      });
    }
    return days;
  };

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: getDateKey(date),
        day: date.getDate(),
        dayName: date.toLocaleDateString('en', { weekday: 'short' })
      });
    }
    return days;
  };

  const getWeeklyProgress = () => {
    const last7Days = getLast7Days();
    return last7Days.map(day => {
      const completed = habits.filter(habit => habit.completions[day.date]).length;
      return {
        day: day.dayName,
        completed,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      };
    });
  };

  const getHabitAnalytics = (habit) => {
    const last30Days = getLast30Days();
    return last30Days.map(day => ({
      date: day.date,
      day: day.day,
      completed: habit.completions[day.date] ? 1 : 0
    }));
  };

  const totalCompletions = useMemo(() => {
    return habits.reduce((sum, habit) => sum + Object.keys(habit.completions).length, 0);
  }, [habits]);

  const averageStreak = useMemo(() => {
    return habits.length > 0 ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length) : 0;
  }, [habits]);

  // Custom Chart Components
  const SimpleBarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.completed));
    
    return (
      <div className="w-full" style={{ height }}>
        <div className="flex items-end justify-center h-full gap-4 px-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 min-h-[4px]"
                  style={{
                    height: maxValue > 0 ? `${(item.completed / maxValue) * 80}%` : '4px'
                  }}
                  title={`${item.day}: ${item.completed}/${item.total} habits (${item.percentage}%)`}
                />
                <div className="text-xs text-gray-600 mt-2">{item.day}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SimpleLineChart = ({ data, color, height = 200 }) => {
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: item.completed ? 20 : 80,
      completed: item.completed
    }));

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <div className="w-full" style={{ height }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="grid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3f4f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <defs>
            <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#smallGrid)" />
          
          {/* Data line */}
          <path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={point.completed ? color : '#e5e7eb'}
              stroke={color}
              strokeWidth="1"
            />
          ))}
          
          {/* Labels */}
          <text x="5" y="25" className="text-xs fill-green-600" fontSize="4">Completed</text>
          <text x="5" y="85" className="text-xs fill-gray-400" fontSize="4">Missed</text>
        </svg>
      </div>
    );
  };

  const HeatmapCell = ({ habit, date, size = 'w-8 h-8' }) => {
    const isCompleted = habit.completions[date.date];
    const isCurrentDay = isToday(date.date);
    
    return (
      <div
        className={`${size} rounded cursor-pointer transition-all duration-200 border-2 ${
          isCurrentDay ? 'border-gray-400' : 'border-transparent'
        } ${
          isCompleted 
            ? 'opacity-100 shadow-md hover:scale-110' 
            : 'opacity-30 hover:opacity-60'
        }`}
        style={{ backgroundColor: habit.color }}
        onClick={() => toggleCompletion(habit.id, new Date(date.date))}
        title={`${habit.name} - ${date.date} ${isCompleted ? '✓' : '○'}`}
      />
    );
  };

  if (view === 'analytics' && selectedHabit) {
    const habit = habits.find(h => h.id === selectedHabit);
    const analytics = getHabitAnalytics(habit);
    const completionRate = Math.round((Object.keys(habit.completions).length / 30) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('dashboard')}
                className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Analytics: {habit.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }}></div>
                <h3 className="text-lg font-semibold">Current Streak</h3>
              </div>
              <p className="text-3xl font-bold text-gray-800">{habit.streak} days</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Total Completions</h3>
              <p className="text-3xl font-bold text-gray-800">{Object.keys(habit.completions).length}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Success Rate (30 days)</h3>
              <p className="text-3xl font-bold text-gray-800">{completionRate}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">30-Day Progress Trend</h3>
            <SimpleLineChart data={analytics} color={habit.color} height={300} />
            <div className="mt-4 text-center text-sm text-gray-600">
              Last 30 days • Green dots = completed, Gray dots = missed
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">30-Day Calendar Heatmap</h3>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {analytics.map((day, index) => (
                <HeatmapCell key={index} habit={habit} date={day} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded opacity-30" style={{ backgroundColor: habit.color }}></div>
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: habit.color }}></div>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Habit Tracker</h1>
          <p className="text-gray-600">Build better habits, one day at a time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Habits</p>
                <p className="text-3xl font-bold text-gray-800">{habits.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Completions</p>
                <p className="text-3xl font-bold text-gray-800">{totalCompletions}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Streak</p>
                <p className="text-3xl font-bold text-gray-800">{averageStreak} days</p>
              </div>
              <Award className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Add New Habit */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter habit name..."
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    selectedColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <button
              onClick={addHabit}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Weekly Progress</h2>
          </div>
          <SimpleBarChart data={getWeeklyProgress()} height={250} />
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          {habits.map(habit => {
            const last7Days = getLast7Days();
            const todayKey = getDateKey(new Date());
            const isCompletedToday = habit.completions[todayKey];
            
            return (
              <div key={habit.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: habit.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-800">{habit.name}</h3>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {habit.streak} day streak
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedHabit(habit.id);
                        setView('analytics');
                      }}
                      className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                      title="View Analytics"
                    >
                      <TrendingUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleCompletion(habit.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        isCompletedToday
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isCompletedToday ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                      {isCompletedToday ? 'Completed Today' : 'Mark Complete'}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">Last 7 days:</span>
                    {last7Days.map(day => (
                      <HeatmapCell 
                        key={day.date} 
                        habit={habit} 
                        date={day} 
                        size="w-6 h-6" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {habits.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No habits yet</h3>
            <p className="text-gray-500">Add your first habit above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;