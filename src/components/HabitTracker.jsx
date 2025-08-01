import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, TrendingUp, Award, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = getDateKey(date);
      last30Days.push({
        date: dateKey,
        day: date.getDate(),
        completed: habit.completions[dateKey] ? 1 : 0
      });
    }
    return last30Days;
  };

  const totalCompletions = useMemo(() => {
    return habits.reduce((sum, habit) => sum + Object.keys(habit.completions).length, 0);
  }, [habits]);

  const averageStreak = useMemo(() => {
    return habits.length > 0 ? Math.round(habits.reduce((sum, habit) => sum + habit.streak, 0) / habits.length) : 0;
  }, [habits]);

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
              <p className="text-3xl font-bold text-gray-800">
                {Math.round((Object.keys(habit.completions).length / 30) * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">30-Day Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 1]} tickFormatter={(value) => value ? 'Done' : 'Missed'} />
                <Tooltip 
                  formatter={(value) => [value ? 'Completed' : 'Missed', 'Status']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={habit.color} 
                  strokeWidth={3}
                  dot={{ fill: habit.color, strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">30-Day Heatmap</h3>
            <div className="grid grid-cols-10 gap-2">
              {analytics.map((day, index) => (
                <HeatmapCell key={index} habit={habit} date={day} />
              ))}
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
          <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getWeeklyProgress()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'completed' ? `${value} completed` : `${value}%`,
                  name === 'completed' ? 'Habits' : 'Success Rate'
                ]}
              />
              <Bar dataKey="completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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