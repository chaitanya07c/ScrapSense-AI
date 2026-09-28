import React, { useState, useEffect } from 'react';
import { 
  Building2, Package, Hash, DollarSign, Calendar, FileText, 
  CheckCircle2, AlertCircle, BrainCircuit, Activity, Clock
} from 'lucide-react';
import { 
  retainPurchaseMemory, recallSupplierMemory, getSupplierInsights, PurchaseMemory 
} from '../utils/hindsightMemory';
import toast from 'react-hot-toast';

const DEMO_SUPPLIERS = [
  'Sri Durga Wines',
  'Lakshmi Bar',
  'Sai Krishna Hotel',
  'Akividu Wine Mart',
  'Bhimavaram Bottles'
];

export default function PurchasesModule() {
  const [formData, setFormData] = useState({
    supplier_name: '',
    bottle_brand: '',
    quantity: '',
    buying_price: '',
    quality: 'Good',
    payment_status: 'Paid',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [insights, setInsights] = useState<any>(null);
  const [timeline, setTimeline] = useState<PurchaseMemory[]>([]);

  useEffect(() => {
    if (formData.supplier_name) {
      const mems = recallSupplierMemory(formData.supplier_name);
      setTimeline(mems);
      setInsights(getSupplierInsights(formData.supplier_name));
    } else {
      setTimeline([]);
      setInsights(null);
    }
  }, [formData.supplier_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { supplier_name, bottle_brand, quantity, buying_price, purchase_date, quality, payment_status, notes } = formData;
    
    if (!supplier_name || !bottle_brand || !quantity || !buying_price || !purchase_date) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const qty = parseInt(quantity);
    const price = parseFloat(buying_price);

    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be a positive number.');
      return;
    }

    if (isNaN(price) || price <= 0) {
      toast.error('Price must be greater than 0.');
      return;
    }

    const newMemory = {
      supplier_name,
      bottle_brand,
      quantity: qty,
      buying_price: price,
      quality,
      payment_status,
      purchase_date,
      notes
    };

    retainPurchaseMemory(newMemory);
    toast.success(`Purchase from ${supplier_name} saved to Hindsight memory.`);
    
    // Refresh timeline and insights
    setTimeline(recallSupplierMemory(supplier_name));
    setInsights(getSupplierInsights(supplier_name));
    
    // Reset partial form
    setFormData(prev => ({
      ...prev,
      bottle_brand: '',
      quantity: '',
      buying_price: '',
      notes: ''
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Column: Form */}
        <div className="flex-1 space-y-6">
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/40 dark:border-slate-800/60 relative overflow-hidden">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Purchase Entry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Supplier <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-5 w-5 text-slate-400" /></div>
                    <select 
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleChange}
                      className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="">Select Supplier</option>
                      {DEMO_SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bottle Brand <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Package className="h-5 w-5 text-slate-400" /></div>
                    <input type="text" name="bottle_brand" value={formData.bottle_brand} onChange={handleChange} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. Kingfisher" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Hash className="h-5 w-5 text-slate-400" /></div>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="0" min="1" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Buying Price (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-slate-400 font-bold px-1">₹</span></div>
                    <input type="number" step="0.01" name="buying_price" value={formData.buying_price} onChange={handleChange} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="0.00" min="0.01" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Purchase Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-slate-400" /></div>
                    <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleChange} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quality Rating <span className="text-red-500">*</span></label>
                  <select name="quality" value={formData.quality} onChange={handleChange} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Payment Status <span className="text-red-500">*</span></label>
                  <select name="payment_status" value={formData.payment_status} onChange={handleChange} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notes</label>
                  <div className="relative">
                    <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none"><FileText className="h-5 w-5 text-slate-400" /></div>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Any special remarks..." />
                  </div>
                </div>

              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Insights & Timeline */}
        <div className="w-full md:w-96 space-y-6">
          
          {/* Smart AI Recommendation Card */}
          {formData.supplier_name ? (
            insights ? (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-700 animate-in zoom-in-95">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <BrainCircuit className="w-5 h-5" />
                      <h3 className="font-bold">AI Recommendation</h3>
                    </div>
                    {insights.riskLevel === 'High' && <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-md font-bold">HIGH RISK</span>}
                  </div>
                  
                  <h4 className="text-lg font-bold mb-4">{formData.supplier_name}</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-300">Last Price</span>
                      <span className="font-bold text-white">{insights.lastPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-300">Average Price</span>
                      <span className="font-bold text-white">{insights.averagePrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-300">Quality Trend</span>
                      <span className={`font-bold ${insights.qualityTrend === 'Excellent' ? 'text-emerald-400' : insights.qualityTrend === 'Poor' ? 'text-red-400' : 'text-amber-400'}`}>
                        {insights.qualityTrend}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm bg-white/5 p-2 rounded-lg">
                      <span className="text-slate-300">Total Purchases</span>
                      <span className="font-bold text-white">{insights.totalPurchases}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1 font-semibold">Recommended Range</p>
                    <p className="text-xl font-bold text-emerald-400">{insights.recommendation}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center animate-in zoom-in-95">
                <BrainCircuit className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500 text-sm font-medium">New supplier. No memory insights available yet.</p>
              </div>
            )
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center text-slate-500">
              <BrainCircuit className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium">Select a supplier to see Hindsight AI insights and recommendations.</p>
            </div>
          )}

          {/* Memory Timeline */}
          <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60 max-h-[500px] overflow-y-auto">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Memory Timeline
            </h3>
            
            {!formData.supplier_name ? (
              <p className="text-sm text-slate-500 text-center py-8">Waiting for supplier selection...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No previous purchases found.</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={item.id} className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700 last:border-0 pb-4 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"></div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.bottle_brand}</span>
                        <span className="text-xs text-slate-500">{item.purchase_date}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {item.quantity} units @ ₹{item.buying_price.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          item.quality === 'Excellent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          item.quality === 'Poor' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {item.quality}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                          item.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {item.payment_status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {item.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
