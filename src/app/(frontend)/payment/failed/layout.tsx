import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'پرداخت ناموفق',
  description: 'پرداخت شما انجام نشد',
  robots: { index: false },
}

export default function PaymentFailedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
