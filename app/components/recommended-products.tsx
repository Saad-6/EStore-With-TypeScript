import React from 'react'
import Link from 'next/link'
import ModernProductCard from './modern-product-card'
import { Product } from '@/interfaces/product-interfaces'

interface RecommendedProductsProps {
  products: Product[]
}

export default function RecommendedProducts({ products }: RecommendedProductsProps) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.slice(0, 3).map((product) => (
          <Link href={`/${product.slug}`} key={product.id}>
            <ModernProductCard
              name={product.name}
              price={product.price}
              image={product.primaryImage.url}
              category={product.category.name}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}