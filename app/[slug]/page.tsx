import { Suspense } from "react"
import { getProduct, getRecommendedProducts } from "../lib/api"
import ClientProductDetails from "./ClientProductDetails"
import RecommendedProducts from "../components/recommended-products"
import UserReviews from "../components/user-review"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
 
  const recommendedProducts = await getRecommendedProducts(params.slug)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientProductDetails product={product} />

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <p className="text-gray-600">{product.description}</p>
      </div>

      <Suspense fallback={<div>Loading reviews...</div>}>
      <UserReviews reviews={product.reviews}></UserReviews>
        {/* Implement UserReviews as a separate component */}
        {/* <UserReviews productId={product.id} /> */}
      </Suspense>

      <div className="mt-12">
        <RecommendedProducts products={recommendedProducts} />
      </div>
    </div>
  )
}

