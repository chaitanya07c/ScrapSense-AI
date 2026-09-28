import React, { useState } from 'react';
import { 
  Users, Search, Filter, Plus, ArrowLeft, Building2, Phone, MapPin, 
  FileText, ShieldAlert, BadgeCheck, Clock, TrendingUp, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, XCircle, Trash2,
  Package, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- MOCK DATA ---
const mockSuppliers = [
  { id: 1, name: 'Sri Durga Wines', type: 'Wine Shop', phone: '+91 9876543210', location: 'Kukatpally, Hyderabad', gst: '36AAAAA1234A1Z1', contactPerson: 'Ramesh', qualityScore: 98, totalPurchases: 12500, amountPaid: '₹1,45,000', avgPrice: '₹8.50', lastTransaction: '2023-10-27' },
  { id: 2, name: 'Balaji Scrap Traders', type: 'Scrap Dealer', phone: '+91 9123456789', location: 'Miyapur, Hyderabad', gst: '', contactPerson: 'Suresh', qualityScore: 75, totalPurchases: 45000, amountPaid: '₹2,80,000', avgPrice: '₹6.20', lastTransaction: '2023-10-26' },
  { id: 3, name: 'City Bars Assoc.', type: 'Bar', phone: '+91 9988776655', location: 'Jubilee Hills, Hyderabad', gst: '36BBBBB1234B1Z2', contactPerson: 'Vikram', qualityScore: 92, totalPurchases: 5000, amountPaid: '₹60,000', avgPrice: '₹12.00', lastTransaction: '2023-10-25' },
  { id: 4, name: 'Royal Wines', type: 'Wine Shop', phone: '+91 9998887776', location: 'Madhapur, Hyderabad', gst: '36CCCCC1234C1Z3', contactPerson: 'Rajesh', qualityScore: 85, totalPurchases: 8200, amountPaid: '₹78,000', avgPrice: '₹9.50', lastTransaction: '2023-10-24' },
  { id: 5, name: 'Venkateshwara Traders', type: 'Hotel', phone: '+91 8887776665', location: 'Banjara Hills, Hyderabad', gst: '', contactPerson: 'Kiran', qualityScore: 88, totalPurchases: 11000, amountPaid: '₹92,400', avgPrice: '₹8.40', lastTransaction: '2023-10-22' },
];

const mockPurchaseHistory = [
  { id: 1, date: '2023-10-27', brand: 'Kingfisher', qty: 1200, price: '₹8.50', quality: 'Excellent', status: 'Completed', notes: 'Clean bottles, no breakage' },
  { id: 2, date: '2023-10-24', brand: 'Bira 91', qty: 600, price: '₹10.50', quality: 'Good', status: 'Completed', notes: 'Standard delivery' },
  { id: 3, date: '2023-10-20', brand: 'Tuborg', qty: 850, price: '₹7.80', quality: 'Average', status: 'Pending', notes: 'Payment delayed due to holiday' },
  { id: 4, date: '2023-10-18', brand: 'Kingfisher', qty: 1500, price: '₹8.40', quality: 'Excellent', status: 'Completed', notes: 'Premium quality lot' },
  { id: 5, date: '2023-10-15', brand: 'Old Monk', qty: 400, price: '₹12.00', quality: 'Good', status: 'Completed', notes: '' },
  { id: 6, date: '2023-10-12', brand: 'Signature', qty: 300, price: '₹9.50', quality: 'Good', status: 'Completed', notes: '' },
  { id: 7, date: '2023-10-09', brand: 'Kingfisher', qty: 1000, price: '₹8.60', quality: 'Average', status: 'Completed', notes: 'Few scratched labels' },
  { id: 8, date: '2023-10-05', brand: 'Budweiser', qty: 250, price: '₹14.00', quality: 'Excellent', status: 'Failed', notes: 'Rejected - wrong size' },
  { id: 9, date: '2023-10-01', brand: 'Tuborg', qty: 1100, price: '₹6.50', quality: 'Poor', status: 'Completed', notes: 'Needs heavy washing' },
  { id: 10, date: '2023-09-28', brand: 'Kingfisher', qty: 2000, price: '₹8.20', quality: 'Good', status: 'Completed', notes: 'Bulk discount applied' },
  { id: 11, date: '2023-09-25', brand: 'Old Monk', qty: 600, price: '₹11.50', quality: 'Excellent', status: 'Completed', notes: '' },
  { id: 12, date: '2023-09-21', brand: 'Bira 91', qty: 450, price: '₹10.00', quality: 'Good', status: 'Pending', notes: 'Awaiting invoice' },
  { id: 13, date: '2023-09-18', brand: 'Kingfisher', qty: 1300, price: '₹8.50', quality: 'Excellent', status: 'Completed', notes: 'Fast delivery' },
  { id: 14, date: '2023-09-15', brand: 'Signature', qty: 200, price: '₹9.20', quality: 'Average', status: 'Completed', notes: '' },
  { id: 15, date: '2023-09-10', brand: 'Budweiser', qty: 350, price: '₹13.50', quality: 'Excellent', status: 'Completed', notes: '' },
];


export default function SuppliersModule() {
  const [view, setView] = useState<'list' | 'add' | 'profile'>('list');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const filteredSuppliers = mockSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.phone.includes(searchTerm) || 
                          s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    setView('list');
  };

  const handleViewProfile = (supplier: any) => {
    setSelectedSupplier(supplier);
    setView('profile');
  };

  const handleDelete = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Delete Supplier</p>
              <p className="mt-1 text-sm text-slate-500">Are you sure you want to delete this supplier? This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.success('Supplier deleted successfully!');
              setView('list');
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ---------------- LIST VIEW ---------------- */}
      {view === 'list' && (
        <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60 min-h-[calc(100vh-12rem)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Supplier Directory
              </h2>
              <p className="text-sm text-slate-500 mt-1">Manage and track your scrap suppliers</p>
            </div>
            
            <button 
              onClick={() => setView('add')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Add Supplier
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <select 
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="All">All Types</option>
                <option value="Wine Shop">Wine Shop</option>
                <option value="Bar">Bar</option>
                <option value="Hotel">Hotel</option>
                <option value="Scrap Dealer">Scrap Dealer</option>
              </select>
            </div>
          </div>

          {filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No suppliers found</h3>
              <p className="text-slate-500 mt-1 max-w-sm">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="py-4 px-4 font-semibold">Supplier Name</th>
                    <th className="py-4 px-4 font-semibold">Type</th>
                    <th className="py-4 px-4 font-semibold">Contact</th>
                    <th className="py-4 px-4 font-semibold">Location</th>
                    <th className="py-4 px-4 font-semibold">Last Purchase</th>
                    <th className="py-4 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700 dark:text-slate-300">
                  {paginatedSuppliers.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span>{row.contactPerson}</span>
                          <span className="text-xs text-slate-500">{row.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">{row.location}</td>
                      <td className="py-4 px-4 text-slate-500">{row.lastTransaction}</td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleViewProfile(row)}
                          className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              <span className="text-sm text-slate-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium px-2">{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- ADD SUPPLIER FORM ---------------- */}
      {view === 'add' && (
        <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-white/40 dark:border-slate-800/60 max-w-3xl mx-auto">
          <button 
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Add New Supplier</h2>
          
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Supplier Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-5 w-5 text-slate-400" /></div>
                  <input required type="text" className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. Balaji Enterprises" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Business Type <span className="text-red-500">*</span></label>
                <select required className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                  <option value="">Select Type</option>
                  <option value="Wine Shop">Wine Shop</option>
                  <option value="Bar">Bar</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Scrap Dealer">Scrap Dealer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contact Person <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Users className="h-5 w-5 text-slate-400" /></div>
                  <input required type="text" className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Name" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-slate-400" /></div>
                  <input required type="tel" className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="+91 xxxxx xxxxx" />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MapPin className="h-5 w-5 text-slate-400" /></div>
                  <input required type="text" className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Full address" />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">GST Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FileText className="h-5 w-5 text-slate-400" /></div>
                  <input type="text" className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. 22AAAAA0000A1Z5" />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notes (Optional)</label>
                <textarea rows={3} className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Any specific requirements or history..." />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setView('list')} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" onClick={() => toast.success('Supplier saved successfully!')} className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---------------- PROFILE VIEW ---------------- */}
      {view === 'profile' && selectedSupplier && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Supplier
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Info & AI Insights */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/20 to-emerald-500/20"></div>
                <div className="relative pt-8 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-4 z-10">
                    <Building2 className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selectedSupplier.name}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mt-2">
                    {selectedSupplier.type}
                  </span>
                </div>
                
                <div className="mt-6 space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <Users className="w-4 h-4" /> {selectedSupplier.contactPerson}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <Phone className="w-4 h-4" /> {selectedSupplier.phone}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                    <MapPin className="w-4 h-4" /> {selectedSupplier.location}
                  </div>
                  {selectedSupplier.gst && (
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <FileText className="w-4 h-4" /> GST: {selectedSupplier.gst}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Summary Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-700">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-indigo-300">
                    <BadgeCheck className="w-5 h-5" />
                    <h3 className="font-bold">AI Supplier Summary</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-indigo-300">Top Brand</p>
                        <p className="font-semibold mt-0.5">Kingfisher</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <p className="text-xs text-emerald-300">Avg Quality</p>
                        <p className="font-semibold mt-0.5">{selectedSupplier.qualityScore}% (High)</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                      <p className="text-xs text-slate-400 mb-2">Pricing History</p>
                      <div className="flex justify-between items-center text-sm">
                        <span>Lowest Paid</span>
                        <span className="font-semibold text-emerald-400">₹8.20</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span>Highest Paid</span>
                        <span className="font-semibold text-red-400">₹10.50</span>
                      </div>
                    </div>

                    <div className={`backdrop-blur-sm rounded-xl p-3 border ${selectedSupplier.qualityScore < 80 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                      <div className="flex items-start gap-2">
                        {selectedSupplier.qualityScore < 80 ? <ShieldAlert className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5 text-white">Risk Indicator: {selectedSupplier.qualityScore < 80 ? 'Medium' : 'Low'}</p>
                          <p className="text-xs text-slate-300">{selectedSupplier.qualityScore < 80 ? 'Occasional quality issues. Inspect deliveries carefully.' : 'Reliable supplier. Consistent quality.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Purchase History */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Bottles", value: selectedSupplier.totalPurchases.toLocaleString(), icon: Package, color: "text-blue-500" },
                  { label: "Amount Paid", value: selectedSupplier.amountPaid, icon: DollarSign, color: "text-emerald-500" },
                  { label: "Avg Price", value: selectedSupplier.avgPrice, icon: TrendingUp, color: "text-purple-500" },
                  { label: "Quality Score", value: `${selectedSupplier.qualityScore}/100`, icon: BadgeCheck, color: "text-amber-500" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white/40 dark:border-slate-800/60">
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{stat.label}</p>
                    <h3 className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-100">{stat.value}</h3>
                  </div>
                ))}
              </div>

              {/* Purchase History Table */}
              <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white/40 dark:border-slate-800/60 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Purchase History</h3>
                  <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Download CSV</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                        <th className="pb-3 px-2 font-semibold">Date</th>
                        <th className="pb-3 px-2 font-semibold">Brand</th>
                        <th className="pb-3 px-2 font-semibold">Qty</th>
                        <th className="pb-3 px-2 font-semibold">Price</th>
                        <th className="pb-3 px-2 font-semibold">Quality</th>
                        <th className="pb-3 px-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 dark:text-slate-300">
                      {mockPurchaseHistory.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                          <td className="py-3 px-2 font-medium">{row.brand}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
