'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Paperclip,
  ChevronDown,
  File,
  ArrowRight,
  Tag,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import type { SerializedEditorState } from 'lexical';
import { formatPrice, getPlainText, hasDiscount, discountPercent } from '@/lib/course-utils';
import { formatFileSize, type ProductFile } from '@/lib/product-utils';

type Product = {
  id: string | number;
  title: string;
  slug: string;
  description?: SerializedEditorState;
  price: number;
  originalPrice?: number | null;
  status?: 'draft' | 'published' | 'coming_soon';
  thumbnail?: { url: string } | null;
  category?: { name: string } | null;
  files?: ProductFile[];
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl h-64 sm:h-80 lg:h-96 bg-white/5 border border-white/10 animate-pulse mb-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
              <div className="mt-8 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center py-24">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Paperclip size={32} className="text-gray-500" />
          </div>
          <h1 className="text-3xl font-siavash font-bold text-white mb-4">محصول یافت نشد</h1>
          <p className="text-gray-400 font-vazir mb-8">متأسفانه این محصول وجود ندارد یا هنوز منتشر نشده</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-vazir transition-all duration-300"
            >
              بازگشت به محصولات
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FileItem({ file, index, isLast }: { file: ProductFile; index: number; isLast: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        <File size={14} className="text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-vazir text-white/90 whitespace-normal break-words" dir="ltr" style={{ textAlign: 'right' }}>
          {file.filename}
        </p>
      </div>
      {file.filesize != null && file.filesize > 0 && (
        <span className="text-xs font-vazir text-gray-500 flex-shrink-0" dir="ltr">
          {formatFileSize(file.filesize)}
        </span>
      )}
    </motion.div>
  );
}

export default function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [discount, setDiscount] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const purchaseKey = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/public/products/${slug}`),
      fetch('/api/auth/me'),
    ])
      .then(async ([productRes, authRes]) => {
        if (!productRes.ok) throw new Error('not found');
        const productData = await productRes.json();
        const authData = await authRes.json();

        if (!productData.product) {
          setNotFound(true);
          return;
        }

        setProduct(productData.product);
        setIsLoggedIn(!!authData.user);
        setIsPurchased(productData.isPurchased || false);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handlePurchase() {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=${encodeURIComponent(`/products/${slug}`)}`;
      return;
    }

    if (isPurchased) {
      window.location.href = `/dashboard/products/${slug}`;
      return;
    }

    setPurchasing(true);
    purchaseKey.current ??= crypto.randomUUID();
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': purchaseKey.current,
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product?.id,
          ...(discount ? { discountCode: discount.code } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.enrolled) {
          setIsPurchased(true);
          return;
        }
        if (!data.preserveIdempotencyKey) purchaseKey.current = null;
        alert(data.error || 'خطا در ایجاد پرداخت');
        return;
      }

      if (data.enrolled) {
        setIsPurchased(true);
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      alert('خطا در ارتباط با سرور');
    } finally {
      setPurchasing(false);
    }
  }

  async function applyCoupon() {
    if (couponLoading || !codeInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: codeInput, productId: product?.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setDiscount(null);
        setCouponError(data.error || 'خطا در بررسی کد تخفیف');
        return;
      }

      if (data.valid) {
        setDiscount({
          code: data.code,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount,
        });
        setCodeInput('');
      } else {
        setDiscount(null);
        setCouponError(data.message || 'کد تخفیف معتبر نیست');
      }
    } catch {
      setCouponError('خطا در ارتباط با سرور');
    } finally {
      setCouponLoading(false);
    }
  }

  function clearCoupon() {
    setDiscount(null);
    setCouponError(null);
  }

  if (loading) return <LoadingSkeleton />;
  if (notFound || !product) return <NotFoundState />;

  const description = getPlainText(product.description) || 'توضیحاتی ثبت نشده است';
  const thumbnailUrl = product.thumbnail?.url;
  const categoryName = product.category?.name;
  const files = product.files ?? [];
  const isFree = typeof product.price === 'number' && product.price <= 0;
  const showDiscountInput =
    isLoggedIn && !isPurchased && !isFree && product.status !== 'coming_soon';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description,
    ...(thumbnailUrl && { image: thumbnailUrl }),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'IRR',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={product.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/50 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {categoryName && (
                <span className="inline-block px-3 py-1 mb-3 text-xs font-vazir font-medium text-blue-300 bg-blue-500/20 border border-blue-500/20 rounded-full">
                  {categoryName}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-siavash font-bold text-white mb-2">
                {product.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Description + Files */}
            <div className="order-2 lg:order-1 lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-xl font-siavash font-bold text-white mb-4">درباره محصول</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-sm font-vazir text-gray-300 leading-relaxed whitespace-pre-line text-justify">
                    {description}
                  </p>
                </div>
              </motion.div>

              {/* Files */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10"
              >
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-3 mb-4 group w-full text-right"
                >
                  <h2 className="text-xl font-siavash font-bold text-white">فایل‌های محصول</h2>
                  <span className="text-xs font-vazir text-gray-500">
                    ({files.length.toLocaleString('fa-IR')} فایل)
                  </span>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="me-auto"
                  >
                    <ChevronDown size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                    >
                      {files.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-400 font-vazir text-sm">
                            فایلی برای این محصول ثبت نشده
                          </p>
                        </div>
                      ) : (
                        files.map((file, i) => (
                          <FileItem
                            key={file.id}
                            file={file}
                            index={i}
                            isLast={i === files.length - 1}
                          />
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Right: Sidebar */}
            <div className="order-1 lg:order-2 lg:col-span-1">
              <h2
                aria-hidden="true"
                className="hidden lg:block text-xl font-siavash font-bold text-transparent mb-4 select-none"
              >
                درباره محصول
              </h2>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="sticky top-24"
              >
                <div className="bg-white/[0.08] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/5">
                    {product.status === 'coming_soon' ? (
                      <div className="mb-4">
                        <span className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-sm font-vazir text-amber-300 font-medium">
                          به زودی
                        </span>
                        <p className="text-xs text-gray-500 font-vazir mt-2">
                          این محصول هنوز منتشر نشده است
                        </p>
                      </div>
                    ) : hasDiscount(product.price, product.originalPrice) ? (
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="px-2.5 py-1 bg-red-500/20 text-red-300 text-sm font-vazir rounded-full font-medium">
                            {discountPercent(product.price, product.originalPrice)}%-
                          </span>
                          <span className="text-lg text-gray-500 line-through font-vazir">
                            {formatPrice(product.originalPrice!)}
                          </span>
                        </div>
                        {isFree ? (
                          <span className="text-3xl font-bold text-green-400 font-vazir">رایگان</span>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white font-vazir">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-500 font-vazir">تومان</span>
                          </div>
                        )}
                      </div>
                    ) : isFree ? (
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-green-400 font-vazir">رایگان</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-white font-vazir">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-gray-500 font-vazir">تومان</span>
                        </div>
                      </div>
                    )}

                    {showDiscountInput && (
                      <div className="mb-4 space-y-3">
                        {discount ? (
                          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-vazir text-green-300">
                                کد تخفیف «{discount.code}» اعمال شد
                              </span>
                              <button
                                onClick={clearCoupon}
                                className="text-xs font-vazir text-gray-400 hover:text-white transition-colors"
                              >
                                حذف
                              </button>
                            </div>
                            {discount.discountAmount > 0 && (
                              <div className="flex items-center justify-between text-xs font-vazir text-red-400">
                                <span>سود شما با این کد</span>
                                <span>{formatPrice(discount.discountAmount)} تومان</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm font-vazir">
                              <span className="text-gray-400">قیمت نهایی</span>
                              <span className="font-bold text-white">
                                {formatPrice(discount.finalAmount)}
                                <span className="text-xs text-gray-500"> تومان</span>
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') applyCoupon();
                                }}
                                placeholder="کد تخفیف"
                                dir="ltr"
                                className="flex-1 min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-vazir text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
                              />
                              <motion.button
                                whileHover={{ scale: couponLoading ? 1 : 1.02 }}
                                whileTap={{ scale: couponLoading ? 1 : 0.98 }}
                                onClick={applyCoupon}
                                disabled={couponLoading}
                                className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-vazir font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-60 flex items-center gap-1.5 transition-all duration-300"
                              >
                                {couponLoading ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Tag size={14} />
                                )}
                                {couponLoading ? 'بررسی...' : 'اعمال'}
                              </motion.button>
                            </div>
                            {couponError && (
                              <p className="mt-2 text-xs font-vazir text-red-400">{couponError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <motion.button
                      whileHover={product.status === 'coming_soon' ? undefined : { scale: 1.02 }}
                      whileTap={product.status === 'coming_soon' ? undefined : { scale: 0.98 }}
                      onClick={product.status === 'coming_soon' ? undefined : handlePurchase}
                      disabled={purchasing || product.status === 'coming_soon'}
                      className="w-full py-3.5 rounded-xl text-white font-vazir font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.65)]"
                    >
                      {product.status === 'coming_soon' ? (
                        'به زودی'
                      ) : purchasing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          در حال انتقال...
                        </>
                      ) : isPurchased ? (
                        <>
                          دانلود فایل‌ها از داشبورد
                          <ArrowRight size={16} />
                        </>
                      ) : !isLoggedIn ? (
                        <>
                          {isFree ? 'ورود برای دریافت رایگان' : 'ورود برای خرید'}
                          <ArrowRight size={16} />
                        </>
                      ) : (
                        <>
                          {isFree ? 'دریافت رایگان' : 'خرید فایل‌ها'}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Info list */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Paperclip size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-vazir">تعداد فایل‌ها</p>
                        <p className="text-sm text-white font-vazir">{files.length.toLocaleString('fa-IR')} فایل</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-vazir">لینک دانلود امن</p>
                        <p className="text-sm text-white font-vazir">اختصاصی و محدود به زمان</p>
                      </div>
                    </div>

                    {categoryName && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <Tag size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-vazir">دسته‌بندی</p>
                          <p className="text-sm text-white font-vazir">{categoryName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
