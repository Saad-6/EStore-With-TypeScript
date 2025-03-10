import type { Product } from "@/interfaces/product-interfaces"

const API_BASE_URL = 'https://localhost:7007/api'

export async function getProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/Product/${slug}`)
  if (!res.ok) {
    throw new Error("Failed to fetch product")
  }
  return res.json()
}

export async function getRecommendedProducts(slug: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/Product/recommendations/${slug}`)
  if (!res.ok) {
    throw new Error("Failed to fetch recommended products")
  }
  return res.json()
}

