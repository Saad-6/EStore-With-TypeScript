import Image from 'next/image'

interface ProductCardProps {
  name: string
  price: number
  image: string
  category: string
}

export default function ModernProductCard({ name, price, image, category }: ProductCardProps) {
  return (
    <div className="group relative">
      <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 group-hover:opacity-75 sm:h-64">
        <Image
          src={image}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <h3 className="mt-6 text-sm text-gray-500">
        <span className="absolute inset-0"></span>
        {category}
      </h3>
      <p className="text-base font-semibold text-gray-900">{name}</p>
      <p className="mt-1 text-sm text-gray-500">${price.toFixed(2)}</p>
    </div>
  )
}