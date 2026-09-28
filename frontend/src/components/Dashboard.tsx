import React from 'react';
import { 
  DollarSign, Package, Users, AlertCircle, TrendingUp, BrainCircuit,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const mockPurchases = [
  { id: 1, supplier: 'Sri Durga Wines', brand: 'Kingfisher', qty: 1200, price: '₹8.50', quality: 'Excellent', status: 'Completed', date: '2023-10-27' },
  { id: 2, supplier: 'Balaji Scrap Traders', brand: 'Tuborg', qty: 450, price: '₹6.20', quality: 'Good', status: 'Pending', date: '2023-10-27' },
  { id: 3, supplier: 'City Bars Assoc.', brand: 'Old Monk', qty: 850, price: '₹12.00', quality: 'Excellent', status: 'Completed', date: '2023-10-26' },
  { id: 4, supplier: 'Royal Wines', brand: 'Signature', qty: 200, price: '₹9.50', quality: 'Average', status: 'Completed', date: '2023-10-26' },
  { id: 5, supplier: 'Venkateshwara Traders', brand: 'Kingfisher', qty: 3200, price: '₹8.40', quality: 'Good', status: 'Pending', date: '2023-10-25' },
  { id: 6, supplier: 'Lakshmi Bar & Resto', brand: 'Budweiser', qty: 150, price: '₹14.00', quality: 'Excellent', status: 'Completed', date: '2023-10-25' },
  { id: 7, supplier: 'Sri Durga Wines', brand: 'Bira 91', qty: 600, price: '₹10.50', quality: 'Good', status: 'Completed', date: '2023-10-24' },
  { id: 8, supplier: 'Om Sai Scrap', brand: 'Tuborg', qty: 800, price: '₹6.00', quality: 'Poor', status: 'Failed', date: '2023-10-24' },
  { id: 9, supplier: 'Golden Tavern', brand: 'Old Monk', qty: 1100, price: '₹11.50', quality: 'Excellent', status: 'Pending', date: '2023-10-23' },
  { id: 10, supplier: 'Balaji Scrap Traders', brand: 'Kingfisher', qty: 950, price: '₹8.60', quality: 'Good', status: 'Completed', date: '2023-10-22' },
];

const monthlyTrend = [
  { name: 'May', amount: 400000 },
  { name: 'Jun', amount: 300000 },
  { name: 'Jul', amount: 550000 },
  { name: 'Aug', amount: 480000 },
  { name: 'Sep', amount: 600000 },
  { name: 'Oct', amount: 750000 },
];

const brandDist = [
  { name: 'Kingfisher', value: 45 },
  { name: 'Tuborg', value: 25 },
  { name: 'Old Monk', value: 20 },
  { name: 'Others', value: 10 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#64748b'];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[
          { label: "Today's Purchase", value: "₹45,200", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Total Suppliers", value: "124", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Bottles", value: "8,430", icon: Package, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Pending Payments", value: "₹12,450", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Bottle Price", value: "₹8.45", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "AI Memory Records", value: "24.5k", icon: BrainCircuit, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/40 dark:border-slate-800/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2 text-slate-800 dark:text-slate-100">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60">
            <h3 className="font-bold text-lg mb-6 text-slate-800 dark:text-slate-100">Monthly Purchase Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Purchases Table */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Recent Purchases</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="pb-3 font-semibold px-2">Supplier</th>
                    <th className="pb-3 font-semibold px-2">Brand</th>
                    <th className="pb-3 font-semibold px-2">Qty</th>
                    <th className="pb-3 font-semibold px-2">Price</th>
                    <th className="pb-3 font-semibold px-2">Quality</th>
                    <th className="pb-3 font-semibold px-2">Status</th>
                    <th className="pb-3 font-semibold px-2">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 dark:text-slate-300">
                  {mockPurchases.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-2 font-medium">{row.supplier}</td>
                      <td className="py-3 px-2">{row.brand}</td>
                      <td className="py-3 px-2">{row.qty}</td>
                      <td className="py-3 px-2 font-medium">{row.price}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          row.quality === 'Excellent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          row.quality === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          row.quality === 'Average' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {row.quality}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`flex inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          row.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          row.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {row.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {row.status === 'Pending' && <Clock className="w-3 h-3" />}
                          {row.status === 'Failed' && <XCircle className="w-3 h-3" />}
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 text-xs">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side Panel: Insights & Pie Chart */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-700">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors"></div>
            <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-colors"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <BrainCircuit className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-lg">AI Insights</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-xs text-blue-300 font-medium uppercase tracking-wider mb-1">Best Quality</p>
                  <p className="text-sm font-medium">Sri Durga Wines maintains 98% quality rating.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-xs text-emerald-300 font-medium uppercase tracking-wider mb-1">Best Price</p>
                  <p className="text-sm font-medium">Balaji Scrap Traders offers lowest Tuborg price (₹6.20 avg).</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-xs text-amber-300 font-medium uppercase tracking-wider mb-1">Action Needed</p>
                  <p className="text-sm font-medium">₹12,450 pending payment to Venkateshwara Traders.</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <p className="text-xs text-purple-300 font-medium uppercase tracking-wider mb-1">Trending</p>
                  <p className="text-sm font-medium">Kingfisher accounts for 45% of total purchases this week.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Distribution Chart */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60">
            <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">Brand Distribution</h3>
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {brandDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">8.4k</p>
                  <p className="text-xs text-slate-500">Total Bottles</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              {brandDist.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
