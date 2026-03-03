import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Wallet, 
  CreditCard, 
  BarChart3, 
  Settings as SettingsIcon,
  Plus,
  Search,
  ChevronRight,
  Menu,
  X,
  Globe,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Package,
  UserPlus,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
type Language = 'en' | 'ps' | 'fa';
type Currency = 'USD' | 'AFN' | 'PKR';

interface Settings {
  baseCurrency: Currency;
  exchangeRateAFN: number;
  exchangeRatePKR: number;
  language: Language;
}

// --- CONTEXTS ---
const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}>({ lang: 'en', setLang: () => {}, t: (k) => k });

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amount: number) => string;
  rates: { AFN: number, PKR: number };
}>({ 
  currency: 'USD', 
  setCurrency: () => {}, 
  format: (a) => `$${a}`,
  rates: { AFN: 80, PKR: 280 }
});

// --- TRANSLATIONS ---
const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    suppliers: 'Suppliers',
    customers: 'Customers',
    cargoEntries: 'Cargo Entries',
    expenses: 'Expenses',
    payments: 'Payments',
    reports: 'Reports',
    settings: 'Settings',
    addCustomer: 'Add Customer',
    addSupplier: 'Add Supplier',
    addCargo: 'Add Cargo Entry',
    addExpense: 'Add Expense',
    addPayment: 'Add Payment',
    cashIn: 'Cash In',
    cashOut: 'Cash Out',
    net: 'Net',
    debts: 'Debts',
    receivables: 'Receivables',
    payables: 'Payables',
    name: 'Name',
    phone: 'Phone',
    country: 'Country',
    type: 'Type',
    weight: 'Weight',
    price: 'Price',
    total: 'Total',
    date: 'Date',
    amount: 'Amount',
    category: 'Category',
    status: 'Status',
    save: 'Save',
    cancel: 'Cancel',
    description: 'Description',
    units: 'Units',
    addUnit: 'Add Unit',
    unitName: 'Unit Name'
  },
  ps: {
    dashboard: 'ډشبورډ',
    suppliers: 'عرضه کوونکي',
    customers: 'پېرودونکي',
    cargoEntries: 'کارګو ریکارډونه',
    expenses: 'لګښتونه',
    payments: 'تادیات',
    reports: 'راپورونه',
    settings: 'تنظیمات',
    addCustomer: 'پېرودونکی اضافه کړئ',
    addSupplier: 'عرضه کوونکی اضافه کړئ',
    addCargo: 'کارګو اضافه کړئ',
    addExpense: 'لګښت اضافه کړئ',
    addPayment: 'تادیه اضافه کړئ',
    cashIn: 'نغدي داخل',
    cashOut: 'نغدي وتل',
    net: 'خالص',
    debts: 'قرضونه',
    receivables: 'طلبونه',
    payables: 'پورونه',
    name: 'نوم',
    phone: 'تلیفون',
    country: 'هیواد',
    type: 'ډول',
    weight: 'وزن',
    price: 'قیمت',
    total: 'ټول',
    date: 'نیټه',
    amount: 'مقدار',
    category: 'کټګوري',
    status: 'حالت',
    save: 'خوندي کول',
    cancel: 'لغوه کول',
    description: 'تفصیل',
    units: 'واحدونه',
    addUnit: 'واحد اضافه کړئ',
    unitName: 'د واحد نوم'
  },
  fa: {
    dashboard: 'داشبورد',
    suppliers: 'تامین کنندگان',
    customers: 'مشتریان',
    cargoEntries: 'ثبت کارگو',
    expenses: 'هزینه ها',
    payments: 'پرداخت ها',
    reports: 'گزارش ها',
    settings: 'تنظیمات',
    addCustomer: 'افزودن مشتری',
    addSupplier: 'افزودن تامین کننده',
    addCargo: 'افزودن کارگو',
    addExpense: 'افزودن هزینه',
    addPayment: 'افزودن پرداخت',
    cashIn: 'ورودی نقد',
    cashOut: 'خروجی نقد',
    net: 'خالص',
    debts: 'قرض ها',
    receivables: 'طلب ها',
    payables: 'بدهی ها',
    name: 'نام',
    phone: 'تلفن',
    country: 'کشور',
    type: 'نوع',
    weight: 'وزن',
    price: 'قیمت',
    total: 'مجموع',
    date: 'تاریخ',
    amount: 'مقدار',
    category: 'کتگوری',
    status: 'حالت',
    save: 'ذخیره',
    cancel: 'لغو',
    description: 'توضیحات',
    units: 'واحدها',
    addUnit: 'افزودن واحد',
    unitName: 'نام واحد'
  }
};

// --- COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const { t, lang } = useContext(LanguageContext);
  const isRtl = lang === 'ps' || lang === 'fa';

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'suppliers', icon: Wallet, label: t('suppliers') },
    { id: 'customers', icon: Users, label: t('customers') },
    { id: 'cargo', icon: Truck, label: t('cargoEntries') },
    { id: 'expenses', icon: CreditCard, label: t('expenses') },
    { id: 'payments', icon: History, label: t('payments') },
    { id: 'reports', icon: BarChart3, label: t('reports') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <div className={`w-64 bg-slate-900 text-white h-screen flex flex-col ${isRtl ? 'order-last' : ''}`}>
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Package className="text-emerald-400" />
          CargoFlow
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useContext(LanguageContext);
  const { format } = useContext(CurrencyContext);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    fetch(`/api/reports/cashflow?from=${monthAgo}&to=${today}`)
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">{t('dashboard')}</h2>
        <p className="text-slate-500">Overview of your cargo operations</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium">{t('cashIn')}</h3>
          <p className="text-2xl font-bold text-slate-900">{format(stats.cashInTotal)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium">{t('cashOut')}</h3>
          <p className="text-2xl font-bold text-slate-900">{format(stats.cashOutTotal)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 font-medium">{t('net')}</h3>
          <p className="text-2xl font-bold text-slate-900">{format(stats.net)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">{t('cashIn')} Breakdown</h3>
          <div className="space-y-4">
            {stats.breakdownIn.map((b: any) => (
              <div key={b.category} className="flex justify-between items-center">
                <span className="text-slate-600">{b.category}</span>
                <span className="font-bold text-emerald-600">{format(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">{t('cashOut')} Breakdown</h3>
          <div className="space-y-4">
            {stats.breakdownOut.map((b: any) => (
              <div key={b.category} className="flex justify-between items-center">
                <span className="text-slate-600">{b.category}</span>
                <span className="font-bold text-rose-600">{format(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Customers = () => {
  const { t } = useContext(LanguageContext);
  const { format } = useContext(CurrencyContext);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', country: '', customerType: 'Regular', notes: '' });

  const fetchCustomers = () => {
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
  };

  useEffect(fetchCustomers, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/customers/${editingId}` : '/api/customers';
    const method = editingId ? 'PUT' : 'POST';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', country: '', customerType: 'Regular', notes: '' });
      fetchCustomers();
    });
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer.id);
    setFormData({ name: customer.name, phone: customer.phone, country: customer.country, customerType: customer.customerType, notes: customer.notes });
    setShowAdd(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      fetch(`/api/customers/${id}`, { method: 'DELETE' }).then(fetchCustomers);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('customers')}</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', country: '', customerType: 'Regular', notes: '' }); setShowAdd(true); }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <UserPlus size={20} />
          {t('addCustomer')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('name')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('phone')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('country')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('receivables')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4 text-slate-500">{c.phone}</td>
                <td className="px-6 py-4 text-slate-500">{c.country}</td>
                <td className="px-6 py-4 font-bold text-rose-600">{format((c.totalCharged || 0) - (c.totalPaid || 0))}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">{t('addCustomer')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
                  <input 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('country')}</label>
                  <input 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Suppliers = () => {
  const { t } = useContext(LanguageContext);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', country: '', notes: '' });

  const fetchSuppliers = () => {
    fetch('/api/suppliers').then(res => res.json()).then(setSuppliers);
  };

  useEffect(fetchSuppliers, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/suppliers/${editingId}` : '/api/suppliers';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', country: '', notes: '' });
      fetchSuppliers();
    });
  };

  const handleEdit = (supplier: any) => {
    setEditingId(supplier.id);
    setFormData({ name: supplier.name, phone: supplier.phone, country: supplier.country, notes: supplier.notes });
    setShowAdd(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      fetch(`/api/suppliers/${id}`, { method: 'DELETE' }).then(fetchSuppliers);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('suppliers')}</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', phone: '', country: '', notes: '' }); setShowAdd(true); }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          {t('addSupplier')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('name')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('phone')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('country')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">{s.name}</td>
                <td className="px-6 py-4 text-slate-500">{s.phone}</td>
                <td className="px-6 py-4 text-slate-500">{s.country}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(s)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">{t('addSupplier')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('name')}</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('phone')}</label>
                  <input 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('country')}</label>
                  <input 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200">{t('cancel')}</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white">{t('save')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CargoEntries = () => {
  const { t } = useContext(LanguageContext);
  const { format } = useContext(CurrencyContext);
  const [entries, setEntries] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    customerId: '', 
    date: new Date().toISOString().split('T')[0], 
    destinationCountry: '', 
    totalWeight: 0, 
    pricePerUnit: 0, 
    unit: 'kg',
    currency: 'USD',
    status: 'OPEN',
    notes: '' 
  });

  const fetchData = () => {
    fetch('/api/cargo-entries').then(res => res.json()).then(setEntries);
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
    fetch('/api/units').then(res => res.json()).then(setUnits);
  };

  useEffect(fetchData, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/cargo-entries/${editingId}` : '/api/cargo-entries';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ customerId: '', date: new Date().toISOString().split('T')[0], destinationCountry: '', totalWeight: 0, pricePerUnit: 0, unit: 'kg', currency: 'USD', status: 'OPEN', notes: '' });
      fetchData();
    });
  };

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setFormData({ 
      customerId: entry.customerId.toString(), 
      date: entry.date, 
      destinationCountry: entry.destinationCountry, 
      totalWeight: entry.totalWeight, 
      pricePerUnit: entry.pricePerUnit, 
      unit: entry.unit || 'kg',
      currency: entry.currency,
      status: entry.status,
      notes: entry.notes 
    });
    setShowAdd(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this cargo entry?')) {
      fetch(`/api/cargo-entries/${id}`, { method: 'DELETE' }).then(fetchData);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('cargoEntries')}</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ customerId: '', date: new Date().toISOString().split('T')[0], destinationCountry: '', totalWeight: 0, pricePerUnit: 0, currency: 'USD', status: 'OPEN', notes: '' }); setShowAdd(true); }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          {t('addCargo')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">No</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('customers')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('weight')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('total')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Paid</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('status')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{e.cargoEntryNo}</td>
                <td className="px-6 py-4 font-medium">{e.customerName}</td>
                <td className="px-6 py-4 text-slate-500">{e.totalWeight} {e.unit || 'kg'}</td>
                <td className="px-6 py-4 font-bold">{format(e.totalCharge)}</td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{format(e.paidAmount || 0)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    e.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">{t('addCargo')}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('customers')}</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.customerId}
                    onChange={e => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('date')}</label>
                  <input 
                    type="date"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('country')}</label>
                  <input 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.destinationCountry}
                    onChange={e => setFormData({...formData, destinationCountry: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('weight')}</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none"
                      value={formData.totalWeight}
                      onChange={e => setFormData({...formData, totalWeight: parseFloat(e.target.value)})}
                    />
                    <select 
                      className="w-24 px-2 py-2 rounded-xl border border-slate-200 outline-none"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                    >
                      {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('price')} / {formData.unit}</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.pricePerUnit}
                    onChange={e => setFormData({...formData, pricePerUnit: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('status')}</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Expenses = () => {
  const { t } = useContext(LanguageContext);
  const { format } = useContext(CurrencyContext);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    amount: 0, 
    currency: 'USD', 
    category: 'OFFICE_GENERAL', 
    description: '' 
  });

  const fetchExpenses = () => {
    fetch('/api/expenses')
      .then(res => res.json())
      .then(setExpenses);
  };

  useEffect(fetchExpenses, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ date: new Date().toISOString().split('T')[0], amount: 0, currency: 'USD', category: 'OFFICE_GENERAL', description: '' });
      fetchExpenses();
    });
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setFormData({ 
      date: expense.date, 
      amount: expense.amount, 
      currency: expense.currency, 
      category: expense.category, 
      description: expense.description 
    });
    setShowAdd(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      fetch(`/api/expenses/${id}`, { method: 'DELETE' }).then(fetchExpenses);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('expenses')}</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ date: new Date().toISOString().split('T')[0], amount: 0, currency: 'USD', category: 'OFFICE_GENERAL', description: '' }); setShowAdd(true); }}
          className="bg-rose-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-rose-600 transition-colors"
        >
          <Plus size={20} />
          {t('addExpense')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('date')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('category')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('amount')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500">{e.date}</td>
                <td className="px-6 py-4 font-medium">{e.category}</td>
                <td className="px-6 py-4 font-bold text-rose-600">{format(e.amount)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No expenses recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">{t('addExpense')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('date')}</label>
                  <input type="date" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('amount')}</label>
                  <input type="number" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('category')}</label>
                  <select className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="OFFICE_GENERAL">Office General</option>
                    <option value="UPS_EXPENSE">UPS Expense</option>
                    <option value="OTHER_EXPENSE">Other Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('description')}</label>
                  <textarea className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200">{t('cancel')}</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-rose-500 text-white">{t('save')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Payments = () => {
  const { t } = useContext(LanguageContext);
  const { format } = useContext(CurrencyContext);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [cargoEntries, setCargoEntries] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'USD',
    method: 'Cash',
    partyType: 'CUSTOMER',
    partyId: '',
    referenceType: 'CARGO_ENTRY',
    referenceId: '',
    kind: 'CARGO_PAYMENT'
  });

  const [payments, setPayments] = useState<any[]>([]);
  const fetchData = () => {
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
    fetch('/api/suppliers').then(res => res.json()).then(setSuppliers);
    fetch('/api/cargo-entries').then(res => res.json()).then(setCargoEntries);
    fetch('/api/payments').then(res => res.json()).then(setPayments);
  };

  useEffect(fetchData, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/payments/${editingId}` : '/api/payments';
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(() => {
      setShowAdd(false);
      setEditingId(null);
      setFormData({ date: new Date().toISOString().split('T')[0], amount: 0, currency: 'USD', method: 'Cash', partyType: 'CUSTOMER', partyId: '', referenceType: 'CARGO_ENTRY', referenceId: '', kind: 'CARGO_PAYMENT' });
      fetchData();
    });
  };

  const handleEdit = (payment: any) => {
    setEditingId(payment.id);
    setFormData({ 
      date: payment.date, 
      amount: payment.amount, 
      currency: payment.currency, 
      method: payment.method, 
      partyType: payment.partyType, 
      partyId: payment.partyId.toString(), 
      referenceType: payment.referenceType, 
      referenceId: payment.referenceId ? payment.referenceId.toString() : '', 
      kind: payment.kind 
    });
    setShowAdd(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this payment? This will also reverse the ledger entry.')) {
      fetch(`/api/payments/${id}`, { method: 'DELETE' }).then(fetchData);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('payments')}</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ date: new Date().toISOString().split('T')[0], amount: 0, currency: 'USD', method: 'Cash', partyType: 'CUSTOMER', partyId: '', referenceType: 'CARGO_ENTRY', referenceId: '', kind: 'CARGO_PAYMENT' }); setShowAdd(true); }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          {t('addPayment')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('date')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Party</th>
              <th className="px-6 py-4 font-semibold text-slate-600">{t('amount')}</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Method</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500">{p.date}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{p.partyName}</div>
                  <div className="text-xs text-slate-400">{p.partyType}</div>
                </td>
                <td className="px-6 py-4 font-bold text-emerald-600">{format(p.amount)}</td>
                <td className="px-6 py-4 text-slate-500">{p.method}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No payments recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6">{t('addPayment')}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Party Type</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.partyType}
                    onChange={e => setFormData({...formData, partyType: e.target.value, partyId: '', kind: e.target.value === 'CUSTOMER' ? 'CARGO_PAYMENT' : 'SUPPLIER_PAYMENT'})}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="SUPPLIER">Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Party</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.partyId}
                    onChange={e => setFormData({...formData, partyId: e.target.value})}
                  >
                    <option value="">Select...</option>
                    {formData.partyType === 'CUSTOMER' 
                      ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                      : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    }
                  </select>
                </div>
                {formData.partyType === 'CUSTOMER' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('cargoEntries')}</label>
                    <select 
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                      value={formData.referenceId}
                      onChange={e => setFormData({...formData, referenceId: e.target.value, referenceType: e.target.value ? 'CARGO_ENTRY' : 'NONE'})}
                    >
                      <option value="">Link to Cargo Entry (Optional)</option>
                      {cargoEntries.filter(ce => ce.customerId.toString() === formData.partyId).map(ce => (
                        <option key={ce.id} value={ce.id}>{ce.cargoEntryNo} ({format(ce.totalCharge)})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('amount')}</label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                  <select 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="USD">USD</option>
                    <option value="AFN">AFN</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200">{t('cancel')}</button>
                  <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white">{t('save')}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Reports = () => {
  const { t } = useContext(LanguageContext);
  const { format } = useContext(CurrencyContext);
  const [cashflow, setCashflow] = useState<any>(null);
  const [debts, setDebts] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ from: '2020-01-01', to: new Date().toISOString().split('T')[0] });

  const fetchReports = () => {
    fetch(`/api/reports/cashflow?from=${dateRange.from}&to=${dateRange.to}`).then(res => res.json()).then(setCashflow);
    fetch('/api/reports/debts').then(res => res.json()).then(setDebts);
  };

  useEffect(fetchReports, [dateRange]);

  if (!cashflow || !debts) return <div className="p-8">Loading Reports...</div>;

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t('reports')}</h2>
          <p className="text-slate-500">Financial summary and debt analysis</p>
        </div>
        <div className="flex gap-4">
          <input type="date" className="px-4 py-2 rounded-xl border border-slate-200" value={dateRange.from} onChange={e => setDateRange({...dateRange, from: e.target.value})} />
          <input type="date" className="px-4 py-2 rounded-xl border border-slate-200" value={dateRange.to} onChange={e => setDateRange({...dateRange, to: e.target.value})} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm mb-1">{t('cashIn')}</h3>
          <p className="text-2xl font-bold text-emerald-600">{format(cashflow.cashInTotal)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm mb-1">{t('cashOut')}</h3>
          <p className="text-2xl font-bold text-rose-600">{format(cashflow.cashOutTotal)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm mb-1">{t('net')}</h3>
          <p className="text-2xl font-bold text-blue-600">{format(cashflow.net)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-slate-500 text-sm mb-1">{t('receivables')}</h3>
          <p className="text-2xl font-bold text-amber-600">{format(debts.customerReceivablesTotal)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">Cash In Breakdown</h3>
          <div className="space-y-3">
            {cashflow.breakdownIn.map((b: any) => (
              <div key={b.category} className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-600">{b.category}</span>
                <span className="font-bold">{format(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">Cash Out Breakdown</h3>
          <div className="space-y-3">
            {cashflow.breakdownOut.map((b: any) => (
              <div key={b.category} className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-600">{b.category}</span>
                <span className="font-bold">{format(b.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = () => {
  const { t, lang, setLang } = useContext(LanguageContext);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [newUnit, setNewUnit] = useState('');

  const fetchUnits = () => {
    fetch('/api/units').then(res => res.json()).then(setUnits);
  };

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetchUnits();
  }, []);

  const handleUpdate = (updates: Partial<Settings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.trim()) return;
    fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newUnit })
    }).then(() => {
      setNewUnit('');
      fetchUnits();
    });
  };

  const handleDeleteUnit = (id: number) => {
    fetch(`/api/units/${id}`, { method: 'DELETE' }).then(fetchUnits);
  };

  if (!settings) return null;

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <h2 className="text-2xl font-bold">{t('settings')}</h2>
      
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Language / ژبه / زبان</label>
          <div className="flex gap-2">
            {['en', 'ps', 'fa'].map(l => (
              <button
                key={l}
                onClick={() => { setLang(l as Language); handleUpdate({ language: l as Language }); }}
                className={`px-4 py-2 rounded-xl border transition-all ${
                  lang === l ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {l === 'en' ? 'English' : l === 'ps' ? 'پښتو' : 'دری'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Exchange Rates (Base: USD)</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">1 USD to AFN</span>
              <input 
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                value={settings.exchangeRateAFN}
                onChange={e => handleUpdate({ exchangeRateAFN: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <span className="text-xs text-slate-500">1 USD to PKR</span>
              <input 
                type="number"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none"
                value={settings.exchangeRatePKR}
                onChange={e => handleUpdate({ exchangeRatePKR: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <label className="block text-sm font-medium text-slate-700 mb-2">{t('units')}</label>
          <form onSubmit={handleAddUnit} className="flex gap-2 mb-4">
            <input 
              type="text"
              placeholder={t('unitName')}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none"
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
            />
            <button type="submit" className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2">
              <Plus size={18} />
              {t('addUnit')}
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {units.map(u => (
              <div key={u.id} className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-2">
                <span className="text-sm font-medium">{u.name}</span>
                <button onClick={() => handleDeleteUnit(u.id)} className="text-slate-400 hover:text-rose-500">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  const t = (key: string) => translations[lang][key] || key;
  
  const format = (amount: number) => {
    if (!settings) return `$${amount}`;
    
    let displayAmount = amount;
    if (currency === 'AFN') displayAmount = amount * settings.exchangeRateAFN;
    if (currency === 'PKR') displayAmount = amount * settings.exchangeRatePKR;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(displayAmount);
  };

  const isRtl = lang === 'ps' || lang === 'fa';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <CurrencyContext.Provider value={{ 
        currency, 
        setCurrency, 
        format, 
        rates: { 
          AFN: settings?.exchangeRateAFN || 80, 
          PKR: settings?.exchangeRatePKR || 280 
        } 
      }}>
        <div className={`flex h-screen bg-slate-50 font-sans ${isRtl ? 'flex-row-reverse' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className={`flex flex-col h-full ${isRtl ? 'order-last' : ''}`}>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">Display Currency</label>
              <div className="flex gap-2">
                {['USD', 'AFN', 'PKR'].map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c as Currency)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      currency === c ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'customers' && <Customers />}
                {activeTab === 'suppliers' && <Suppliers />}
                {activeTab === 'cargo' && <CargoEntries />}
                {activeTab === 'expenses' && <Expenses />}
                {activeTab === 'payments' && <Payments />}
                {activeTab === 'reports' && <Reports />}
                {activeTab === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </CurrencyContext.Provider>
    </LanguageContext.Provider>
  );
}
