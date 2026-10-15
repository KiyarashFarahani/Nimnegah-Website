'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Paperclip } from 'lucide-react';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/product-utils';

type Category = {
  id: string;
  name: string;
  slug: string;
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 w-40 bg-white/10 rounded-full mx-auto mb-6" />
            <div className="h-12 w-64 bg-white/10 rounded-lg mx-auto mb-6" />
            <div className="h-1 w-20 bg-white/10 mx-auto mb-6 rounded-full" />
            <div className="h-6 w-96 bg-white/10 rounded mx-auto" />
          </div>

          <div className="max-w-2xl mx-auto mb-8">
            <div className="h-14 bg-white/5 border border-white/10 rounded-2xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-48 sm:h-52 bg-white/5 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-white/10 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <Paperclip size={32} className="text-gray-500" />
      </div>
      <h3 className="text-xl font-siavash font-bold text-white mb-3">
        {hasFilters ? 'محصولی با این فیلترها یافت نشد' : 'هنوز محصولی اضافه نشده'}
      </h3>
      <p className="text-gray-400 font-vazir max-w-md mx-auto">
        {hasFilters
          ? 'فیلترهای خود را تغییر دهید یا فیلترها را پاک کنید'
          : 'به زودی محصولات جدید اضافه می‌شوند'}
      </p>
    </motion.div>
  );
}

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/public/products').then((res) => res.json()),
      fetch('/api/public/categories').then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.products || []);
        setCategories(categoriesData.categories || []);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (category && product.category?.name !== category) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        const titleMatch = product.title.toLowerCase().includes(searchLower);
        const descriptionMatch = product.description?.root?.children?.some(
          (child: { type?: string; text?: string }) =>
            child.type === 'text' && child.text?.toLowerCase().includes(searchLower)
        );
        if (!titleMatch && !descriptionMatch) return false;
      }
      return true;
    });
  }, [products, search, category]);

  const activeFiltersCount = [category].filter(Boolean).length;

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      {/* Hero Section */}
      <div className="pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-siavash font-bold text-white mb-4">
              محصولات دیجیتال
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto mb-4 rounded-full" />
            <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto font-vazir leading-relaxed">
              فایل‌های اختصاصی برای دانلود — پس از خرید، لینک دانلود امن در داشبورد شماست
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative">
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجوی محصول..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 pr-12 pl-12 bg-white/5 border border-white/10 rounded-2xl text-white font-vazir placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-vazir transition-all duration-300 ${
                    !category
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  همه
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-vazir transition-all duration-300 ${
                      category === cat.name
                        ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-center items-center gap-3 mt-4"
                >
                  <span className="text-sm text-gray-500 font-vazir">فیلتر فعال:</span>
                  <button
                    onClick={() => setCategory('')}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs text-red-300 hover:bg-red-500/20 transition-all duration-300"
                  >
                    <X size={12} />
                    پاک کردن
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex justify-center items-center gap-6 mb-6 text-sm text-gray-500 font-vazir"
          >
            <span className="flex items-center gap-2">
              <Paperclip size={16} />
              {filteredProducts.length.toLocaleString('fa-IR')} محصول
            </span>
          </motion.div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <EmptyState hasFilters={activeFiltersCount > 0 || !!search} />
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="flex">
                    <div className="w-full">
                      <ProductCard product={product} index={index} />
                    </div>
                  </div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
