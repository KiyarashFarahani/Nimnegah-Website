import ProductFilesView from '@/components/dashboard/ProductFilesView'

export default async function DashboardProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ProductFilesView slug={slug} />
}
