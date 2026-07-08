import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'پرداخت موفق',
  description: 'پرداخت شما با موفقیت انجام شد',
  robots: { index: false },
}

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
