import { useState, useEffect } from "react";
import {
  getDashboardSummary,
  getSalesReport,
  getTopProducts,
  getCategorySales,
  getCustomerAnalytics,
  getInventoryReport,
} from "../api/analytics.api";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PieChart,
} from "lucide-react";

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [categorySales, setCategorySales] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [dateRange, setDateRange] = useState("30"); // días

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };

      const [
        summaryData,
        salesData,
        topProductsData,
        categorySalesData,
        customerData,
        inventoryData,
      ] = await Promise.all([
        getDashboardSummary(),
        getSalesReport({ ...params, group_by: "day" }),
        getTopProducts({ ...params, limit: 10 }),
        getCategorySales(params),
        getCustomerAnalytics(),
        getInventoryReport(),
      ]);

      setSummary(summaryData);
      setSalesReport(salesData);
      setTopProducts(topProductsData);
      setCategorySales(categorySalesData);
      setCustomerAnalytics(customerData);
      setInventoryReport(inventoryData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Analíticas</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
        </select>
      </div>

      {/* Resumen de métricas principales */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Ventas del mes"
            value={formatCurrency(summary.monthly_sales)}
            icon={<DollarSign className="w-6 h-6" />}
            color="bg-green-500"
          />
          <MetricCard
            title="Órdenes del mes"
            value={summary.monthly_orders}
            icon={<ShoppingCart className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <MetricCard
            title="Productos activos"
            value={summary.active_products}
            icon={<Package className="w-6 h-6" />}
            color="bg-purple-500"
          />
          <MetricCard
            title="Clientes totales"
            value={summary.total_customers}
            icon={<Users className="w-6 h-6" />}
            color="bg-orange-500"
          />
        </div>
      )}

      {/* Gráfico de ventas */}
      {salesReport && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ventas por período
            </h2>
            <div className="text-sm text-gray-600">
              Total: {formatCurrency(salesReport.total_sales)}
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {salesReport.sales_by_period?.slice(-14).map((period, index) => {
              const maxSales = Math.max(
                ...salesReport.sales_by_period.map((p) => p.sales)
              );
              const height = maxSales > 0 ? (period.sales / maxSales) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${formatDate(period.date)}: ${formatCurrency(period.sales)}`}
                  />
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {formatDate(period.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos más vendidos */}
        {topProducts && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Productos más vendidos
            </h2>
            <div className="space-y-3">
              {topProducts.products?.slice(0, 5).map((product, index) => (
                <div
                  key={product.product_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400 w-8">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.product_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.total_quantity} unidades vendidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ventas por categoría */}
        {categorySales && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Ventas por categoría
            </h2>
            <div className="space-y-3">
              {categorySales.categories?.map((category, index) => {
                const totalSales = categorySales.categories.reduce(
                  (sum, cat) => sum + cat.total_sales,
                  0
                );
                const percentage =
                  totalSales > 0 ? (category.total_sales / totalSales) * 100 : 0;
                return (
                  <div key={category.category_id || index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {category.category_name || "Sin categoría"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(category.total_sales)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Analíticas de clientes e inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {customerAnalytics && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Analíticas de clientes
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Clientes activos</span>
                <span className="font-semibold text-gray-900">
                  {customerAnalytics.active_customers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Nuevos clientes</span>
                <span className="font-semibold text-gray-900">
                  {customerAnalytics.new_customers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Ticket promedio</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(customerAnalytics.average_order_value || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {inventoryReport && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Reporte de inventario
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Productos con stock bajo</span>
                <span className="font-semibold text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {inventoryReport.low_stock_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Productos sin stock</span>
                <span className="font-semibold text-red-600">
                  {inventoryReport.out_of_stock_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Valor total del inventario</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(inventoryReport.total_inventory_value || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

