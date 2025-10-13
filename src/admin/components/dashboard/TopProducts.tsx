import { ArrowTrendingUpIcon, StarIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  sales: number;
  rating: number;
  image: string;
  change: number;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    price: 3.99,
    sales: 1245,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1592841200221-1901b4f3c9c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    change: 12.5,
  },
  {
    id: 2,
    name: 'Fresh Strawberries',
    category: 'Fruits',
    price: 5.99,
    sales: 986,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    change: 8.2,
  },
  {
    id: 3,
    name: 'Farm Fresh Eggs',
    category: 'Dairy & Eggs',
    price: 4.99,
    sales: 876,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1587486913049-53fc88980bca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    change: 5.3,
  },
  {
    id: 4,
    name: 'Honey',
    category: 'Pantry',
    price: 8.99,
    sales: 654,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    change: 15.7,
  },
  {
    id: 5,
    name: 'Whole Grain Bread',
    category: 'Bakery',
    price: 4.49,
    sales: 543,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    change: 3.2,
  },
];

export function TopProducts() {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Top Selling Products</h3>
        <p className="mt-1 text-sm text-gray-500">Best performing products by sales volume.</p>
      </div>
      <div className="flow-root">
        <ul className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src={product.image}
                    alt={product.name}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                    <div className="ml-2 flex-shrink-0 flex
                    ">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <ArrowTrendingUpIcon className="-ml-1 mr-1 h-4 w-4 text-green-500" />
                        {product.change}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={`h-4 w-4 ${
                            rating <= Math.round(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">
                        {product.rating}
                      </span>
                    </div>
                    <p className="ml-2 text-xs text-gray-500">
                      {product.sales.toLocaleString()} sales
                    </p>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-gray-500">
                      {product.category} • ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a
            href="#"
            className="font-medium text-green-600 hover:text-green-500"
          >
            View all products<span className="sr-only">, top products</span>
          </a>
        </div>
      </div>
    </div>
  );
}
