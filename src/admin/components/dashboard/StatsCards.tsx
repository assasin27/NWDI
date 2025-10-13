import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { CurrencyDollarIcon, ShoppingBagIcon, UserGroupIcon, CubeIcon } from '@heroicons/react/24/outline';

const stats = [
  { id: 1, name: 'Total Revenue', stat: '$24,123.00', change: '12%', changeType: 'increase' },
  { id: 2, name: 'Total Orders', stat: '1,234', change: '5.4%', changeType: 'increase' },
  { id: 3, name: 'Active Customers', stat: '892', change: '3.2%', changeType: 'decrease' },
  { id: 4, name: 'Products', stat: '156', change: '8.1%', changeType: 'increase' },
];

const iconMap = {
  revenue: CurrencyDollarIcon,
  orders: ShoppingBagIcon,
  customers: UserGroupIcon,
  products: CubeIcon,
};

type StatsCardsProps = {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
  };
};

export function StatsCards({ stats }: StatsCardsProps) {
  const formattedStats = [
    { 
      id: 1, 
      name: 'Total Revenue', 
      stat: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalRevenue),
      change: '12%', 
      changeType: 'increase',
      icon: 'revenue'
    },
    { 
      id: 2, 
      name: 'Total Orders', 
      stat: stats.totalOrders.toLocaleString(), 
      change: '5.4%', 
      changeType: 'increase',
      icon: 'orders'
    },
    { 
      id: 3, 
      name: 'Active Customers', 
      stat: stats.totalCustomers.toLocaleString(), 
      change: '3.2%', 
      changeType: 'decrease',
      icon: 'customers'
    },
    { 
      id: 4, 
      name: 'Products', 
      stat: stats.totalProducts.toLocaleString(), 
      change: '8.1%', 
      changeType: 'increase',
      icon: 'products'
    },
  ];

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {formattedStats.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          return (
            <div
              key={item.id}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <dt>
                <div className="absolute bg-green-500 rounded-md p-3">
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" aria-hidden="true" />
                  ) : (
                    <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                  </span>
                  {item.change}
                </p>
                <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-green-600 hover:text-green-500">
                      View all<span className="sr-only"> {item.name} stats</span>
                    </a>
                  </div>
                </div>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
