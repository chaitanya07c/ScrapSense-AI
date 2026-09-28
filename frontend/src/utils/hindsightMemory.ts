export interface PurchaseMemory {
  id: string;
  supplier_name: string;
  purchase_date: string;
  bottle_brand: string;
  quantity: number;
  buying_price: number;
  quality: string;
  payment_status: string;
  notes: string;
}

const STORAGE_KEY = 'hindsight_purchase_memory';

export const retainPurchaseMemory = (memory: Omit<PurchaseMemory, 'id'>): PurchaseMemory => {
  const memories = getAllMemories();
  const newMemory = {
    ...memory,
    id: Math.random().toString(36).substr(2, 9),
  };
  memories.push(newMemory);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  return newMemory;
};

export const getAllMemories = (): PurchaseMemory[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return getDemoMemories();
  return JSON.parse(data);
};

export const recallSupplierMemory = (supplierName: string): PurchaseMemory[] => {
  const memories = getAllMemories();
  return memories
    .filter(m => m.supplier_name.toLowerCase() === supplierName.toLowerCase())
    .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
};

export const getSupplierInsights = (supplierName: string) => {
  const memories = recallSupplierMemory(supplierName);
  if (memories.length === 0) return null;

  const lastPurchase = memories[0];
  const totalPurchases = memories.length;
  const avgPrice = memories.reduce((acc, curr) => acc + curr.buying_price, 0) / totalPurchases;
  
  const qualityScores: Record<string, number> = { 'Excellent': 4, 'Good': 3, 'Average': 2, 'Poor': 1 };
  const avgQualityScore = memories.reduce((acc, curr) => acc + (qualityScores[curr.quality] || 0), 0) / totalPurchases;
  
  let qualityLabel = 'Average';
  if (avgQualityScore >= 3.5) qualityLabel = 'Excellent';
  else if (avgQualityScore >= 2.5) qualityLabel = 'Good';
  else if (avgQualityScore < 2) qualityLabel = 'Poor';

  const riskLevel = avgQualityScore < 2.5 || memories.some(m => m.payment_status === 'Pending') ? 'High' : 
                   avgQualityScore < 3.2 ? 'Medium' : 'Low';

  const basePrice = avgPrice;
  const recMin = (basePrice * 0.95).toFixed(2);
  const recMax = (basePrice * 1.05).toFixed(2);

  return {
    lastPrice: `₹${lastPurchase.buying_price.toFixed(2)}`,
    averagePrice: `₹${avgPrice.toFixed(2)}`,
    qualityTrend: qualityLabel,
    totalPurchases,
    riskLevel,
    recommendation: `₹${recMin} - ₹${recMax}`,
  };
};

// Seed demo data if none exists
export const getDemoMemories = (): PurchaseMemory[] => {
  const demo: PurchaseMemory[] = [
    { id: '1', supplier_name: 'Sri Durga Wines', purchase_date: '2023-10-25', bottle_brand: 'Kingfisher', quantity: 1200, buying_price: 8.50, quality: 'Good', payment_status: 'Paid', notes: 'Clean' },
    { id: '2', supplier_name: 'Lakshmi Bar', purchase_date: '2023-10-22', bottle_brand: 'Tuborg', quantity: 450, buying_price: 6.20, quality: 'Average', payment_status: 'Pending', notes: 'Late delivery' },
    { id: '3', supplier_name: 'Sai Krishna Hotel', purchase_date: '2023-10-20', bottle_brand: 'Old Monk', quantity: 850, buying_price: 12.00, quality: 'Excellent', payment_status: 'Paid', notes: 'Premium quality' },
    { id: '4', supplier_name: 'Akividu Wine Mart', purchase_date: '2023-10-18', bottle_brand: 'Signature', quantity: 200, buying_price: 9.50, quality: 'Good', payment_status: 'Paid', notes: '' },
    { id: '5', supplier_name: 'Bhimavaram Bottles', purchase_date: '2023-10-15', bottle_brand: 'Kingfisher', quantity: 3200, buying_price: 8.40, quality: 'Good', payment_status: 'Pending', notes: 'Bulk order' },
    { id: '6', supplier_name: 'Sri Durga Wines', purchase_date: '2023-09-25', bottle_brand: 'Kingfisher', quantity: 1000, buying_price: 8.60, quality: 'Poor', payment_status: 'Paid', notes: 'Many broken bottles' },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
  return demo;
};
