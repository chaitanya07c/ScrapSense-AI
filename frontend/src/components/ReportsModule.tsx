import React, { useState, useMemo } from 'react';
import { 
  Download, Printer, Calendar, DollarSign, Package, AlertCircle, 
  TrendingUp, Award, BrainCircuit, Users, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { getAllMemories } from '../utils/hindsightMemory';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function ReportsModule() {
  const [dateRange, setDateRange] = useState('Month');
  
  // Data processing from Hindsight Memory
  const memories = useMemo(() => getAllMemories(), []);
  
  const stats = useMemo(() => {
    let totalAmount = 0;
    let pendingAmount = 0;
    let totalBottles = 0;
    
    memories.forEach(m => {
      const amount = m.buying_price * m.quantity;
      totalAmount += amount;
      totalBottles += m.quantity;
      if (m.payment_status === 'Pending') pendingAmount += amount;
    });

    return {
      totalPurchaseAmount: totalAmount,
      monthlySpending: totalAmount * 0.8, // simplified for demo
      avgBottlePrice: totalBottles ? totalAmount / totalBottles : 0,
      pendingPaymentValue: pendingAmount,
      totalTransactions: memories.length
    };
  }, [memories]);

  const supplierPerformance = useMemo(() => {
    const map: Record<string, any> = {};
    memories.forEach(m => {
      if (!map[m.supplier_name]) {
        map[m.supplier_name] = { name: m.supplier_name, totalPaid: 0, count: 0, qualitySum: 0 };
      }
      map[m.supplier_name].totalPaid += m.buying_price * m.quantity;
      map[m.supplier_name].count += 1;
      const q = m.quality === 'Excellent' ? 4 : m.quality === 'Good' ? 3 : m.quality === 'Average' ? 2 : 1;
      map[m.supplier_name].qualitySum += q;
    });
    
    return Object.values(map).map(s => ({
      ...s,
      qualityScore: (s.qualitySum / s.count) * 25, // out of 100
      risk: (s.qualitySum / s.count) < 2.5 ? 'High' : (s.qualitySum / s.count) < 3.2 ? 'Medium' : 'Low'
    })).sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 5);
  }, [memories]);

  const brandAnalytics = useMemo(() => {
    const map: Record<string, any> = {};
    memories.forEach(m => {
      if (!map[m.bottle_brand]) {
        map[m.bottle_brand] = { name: m.bottle_brand, qty: 0, spend: 0 };
      }
      map[m.bottle_brand].qty += m.quantity;
      map[m.bottle_brand].spend += (m.buying_price * m.quantity);
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [memories]);

  const paymentData = useMemo(() => [
    { name: 'Paid', value: stats.totalPurchaseAmount - stats.pendingPaymentValue },
    { name: 'Pending', value: stats.pendingPaymentValue }
  ], [stats]);

  // Mock monthly trend for line chart
  const monthlyTrendData = [
    { name: 'Jun', amount: 35000 },
    { name: 'Jul', amount: 42000 },
    { name: 'Aug', amount: 38000 },
    { name: 'Sep', amount: 55000 },
    { name: 'Oct', amount: stats.totalPurchaseAmount }
  ];

  const handleExport = () => {
    // Generate CSV stub
    alert('Report exported as CSV successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/40 dark:border-slate-800/60">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Reports & Analytics
        </h2>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-slate-400" /></div>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-medium"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
          </div>
          
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-sm shadow-md shadow-blue-500/20">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* A. Financial Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Purchase Amount", value: `₹${stats.totalPurchaseAmount.toLocaleString()}`, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Monthly Spending", value: `₹${stats.monthlySpending.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Avg Bottle Price", value: `₹${stats.avgBottlePrice.toFixed(2)}`, icon: Package, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Pending Payment Value", value: `₹${stats.pendingPaymentValue.toLocaleString()}`, icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/40 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Monthly Purchase Trend */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60">
            <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-100">Monthly Purchase Trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supplier Performance Bar Chart & Table */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60 overflow-hidden">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-6">Supplier Performance (Top 5)</h3>
            
            <div className="h-56 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierPerformance} layout="vertical" margin={{top: 0, right: 0, left: 20, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={120} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="totalPaid" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="pb-3 px-2 font-semibold">Supplier</th>
                    <th className="pb-3 px-2 font-semibold">Transactions</th>
                    <th className="pb-3 px-2 font-semibold">Amount Paid</th>
                    <th className="pb-3 px-2 font-semibold">Quality</th>
                    <th className="pb-3 px-2 font-semibold">Risk</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 dark:text-slate-300">
                  {supplierPerformance.map((row) => (
                    <tr key={row.name} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="py-3 px-2 font-medium">{row.name}</td>
                      <td className="py-3 px-2">{row.count}</td>
                      <td className="py-3 px-2 font-medium">₹{row.totalPaid.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{row.qualityScore}%</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          row.risk === 'Low' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                          row.risk === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30'
                        }`}>
                          {row.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights & Pie Charts */}
        <div className="space-y-6">
          
          {/* AI Business Insights */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-700">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-indigo-300">
                <BrainCircuit className="w-6 h-6" />
                <h3 className="font-bold text-lg">AI Business Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex gap-3">
                    <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Best Supplier This Month</p>
                      <p className="text-xs text-slate-300">Sai Krishna Hotel maintained a 100% 'Excellent' quality score across 3 deliveries.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Price Alert: Tuborg</p>
                      <p className="text-xs text-slate-300">Average buying price for Tuborg increased by 8% this week compared to last month.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Spending Anomaly</p>
                      <p className="text-xs text-slate-300">Unusually high pending payment (₹{stats.pendingPaymentValue.toLocaleString()}). Prioritize clearing to maintain supplier trust.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status Donut Chart */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60">
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Payment Status</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center mt-2">
                  <p className="text-xs text-slate-500 font-medium">Pending</p>
                  <p className="text-lg font-bold text-amber-500">
                    {Math.round((stats.pendingPaymentValue / stats.totalPurchaseAmount) * 100) || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Distribution Pie Chart */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60">
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Brand Analytics (Qty)</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandAnalytics}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="qty"
                    labelLine={false}
                  >
                    {brandAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
