import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { TransactionType, Category } from '../types';
import { getFinancialAdvice } from '../services/gemini';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, Sparkles, Target, Trophy } from 'lucide-react';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Dashboard: React.FC = () => {
  const { user, transactions, goals } = useApp();
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Prepare chart data
  const categoryData = Object.values(Category).map(cat => {
    const val = transactions
        .filter(t => t.category === cat && t.type === TransactionType.EXPENSE)
        .reduce((acc, t) => acc + t.amount, 0);
    return { name: cat, value: val };
  }).filter(d => d.value > 0);

  useEffect(() => {
    // Only fetch advice if we have some data and haven't fetched recently
    if (transactions.length > 0 && !advice) {
        setLoadingAdvice(true);
        getFinancialAdvice(transactions, user.balance, user.language)
            .then(res => setAdvice(res))
            .catch(() => setAdvice("Keep tracking your expenses to get AI insights."))
            .finally(() => setLoadingAdvice(false));
    }
  }, [transactions, user.balance, user.language, advice]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Hello, {user.name}</h1>
        <p className="text-slate-500">Here's your financial overview secured by blockchain.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Current Balance</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">₹{user.balance.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2">
                <TrendingUp size={16} />
                <span>Safe & Secured</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Total Income</p>
            <h2 className="text-2xl font-bold text-emerald-600 mt-2">+₹{totalIncome.toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Total Spent</p>
            <h2 className="text-2xl font-bold text-rose-500 mt-2">-₹{totalExpense.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px]">
            <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
            {categoryData.length > 0 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => `₹${value}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <p>No expense data yet.</p>
                </div>
            )}
        </div>

        <div className="space-y-6">
            {/* AI Advisor Section */}
            <div className="bg-gradient-to-br from-brand-900 to-brand-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={100} />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-yellow-400" />
                    <h3 className="text-lg font-bold">AI Financial Advisor</h3>
                </div>
                
                <div className="prose prose-invert max-w-none text-brand-50 leading-relaxed text-sm">
                    {loadingAdvice ? (
                        <div className="animate-pulse flex space-y-2 flex-col">
                            <div className="h-4 bg-brand-500 rounded w-3/4"></div>
                            <div className="h-4 bg-brand-500 rounded w-full"></div>
                            <div className="h-4 bg-brand-500 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <p className="whitespace-pre-line">{advice || "Add some transactions to receive personalized advice!"}</p>
                    )}
                </div>
            </div>

            {/* Savings Goals Widget */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Target className="text-brand-600" /> Savings Goals
                </h3>
                <div className="space-y-4">
                    {goals.map(goal => {
                        const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                        return (
                            <div key={goal.id} className="relative">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="font-medium flex items-center gap-2">
                                        <span className="text-xl">{goal.icon}</span> {goal.name}
                                    </span>
                                    <span className="text-sm font-bold text-slate-600">
                                        ₹{goal.currentAmount} / ₹{goal.targetAmount}
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-green-500' : 'bg-brand-500'}`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                                {percent >= 100 && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                        <Trophy size={10} /> DONE
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex gap-2 items-center">
                        <Sparkles size={16} className="shrink-0" />
                        <p>Tip: 5% of every Income is automatically saved to your first goal.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;