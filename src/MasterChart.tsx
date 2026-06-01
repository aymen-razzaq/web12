import React, { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface Order {
  id: string;
  productName?: string;
  shopName?: string;
  price?: string | number;
  status?: string;
  createdAt?: any;
  time?: string;
}

interface MasterChartProps {
  orders: Order[];
  lang: string;
}

export const MasterChart: React.FC<MasterChartProps> = ({ orders, lang }) => {
  const isAr = lang === 'ar';

  const chartData = useMemo(() => {
    // Generate the last 7 days (including today)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return days.map((day) => {
      // Find orders matching this day
      const dayOrders = orders.filter((o) => {
        let orderDate: Date | null = null;
        if (o.createdAt) {
          if (typeof o.createdAt.toDate === 'function') {
            orderDate = o.createdAt.toDate();
          } else if (o.createdAt.seconds) {
            orderDate = new Date(o.createdAt.seconds * 1000);
          } else {
            orderDate = new Date(o.createdAt);
          }
        } else if (o.time) {
          orderDate = new Date(o.time);
        }

        if (!orderDate || isNaN(orderDate.getTime())) return false;

        return (
          orderDate.getFullYear() === day.getFullYear() &&
          orderDate.getMonth() === day.getMonth() &&
          orderDate.getDate() === day.getDate()
        );
      });

      // Format date label
      const label = day.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      return {
        date: label,
        orderCount: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => {
          // Parse price. e.g. "25,000 د.ع" or 25000
          if (!o.price) return sum;
          const parsedStr = String(o.price).replace(/[^\d]/g, '');
          const val = parseInt(parsedStr, 10) || 0;
          return sum + val;
        }, 0),
      };
    });
  }, [orders, isAr]);

  // Aggregate stats
  const totalOrdersLast7Days = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.orderCount, 0);
  }, [chartData]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || !o.status).length;
  }, [orders]);

  const acceptedOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'Accepted').length;
  }, [orders]);

  return (
    <div style={{ fontFamily: isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}>
      {/* Chart Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#2D241E', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#B38B6D' }}></span>
            {isAr ? 'اتجاهات الطلبات (آخر 7 أيام)' : 'Order Trends (Last 7 Days)'}
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8C7E74' }}>
            {isAr ? 'رصد دقيق لنشاط البيع وطلبات الشراء في الوقت الفعلي' : 'Real-time tracking of marketplace transactional activity'}
          </p>
        </div>
        
        {/* Visual Stats Badges */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: '#FAF8F6', border: '1px solid #E8E2DE', borderRadius: '12px', padding: '8px 14px', textAlign: 'center', minWidth: '85px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#8C7E74', fontWeight: 600, letterSpacing: '0.5px' }}>
              {isAr ? 'إجمالي الأسبوع' : 'WEEK TOTAL'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#2D241E', marginTop: '2px' }}>
              {totalOrdersLast7Days}
            </div>
          </div>
          <div style={{ background: 'rgba(255, 193, 7, 0.08)', border: '1px solid rgba(255, 193, 7, 0.25)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center', minWidth: '85px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#D39E00', fontWeight: 600, letterSpacing: '0.5px' }}>
              {isAr ? 'قيد الانتظار' : 'PENDING'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#B38F00', marginTop: '2px' }}>
              {activeOrdersCount}
            </div>
          </div>
          <div style={{ background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.25)', borderRadius: '12px', padding: '8px 14px', textAlign: 'center', minWidth: '85px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#388E3C', fontWeight: 600, letterSpacing: '0.5px' }}>
              {isAr ? 'المقبولة' : 'ACCEPTED'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#2E7D32', marginTop: '2px' }}>
              {acceptedOrdersCount}
            </div>
          </div>
        </div>
      </div>

      {/* Line/Area Chart */}
      <div style={{ width: '100%', height: 260, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B38B6D" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#B38B6D" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E2DE" />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8C7E74', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#8C7E74' }}
              dx={5}
            />
            <Tooltip
              contentStyle={{
                background: '#2D241E',
                border: 'none',
                borderRadius: '12px',
                color: '#FAF8F6',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                fontFamily: isAr ? 'Cairo, sans-serif' : 'Inter, sans-serif',
                fontSize: '12px',
                padding: '10px 14px',
              }}
              labelStyle={{ fontWeight: 700, marginBottom: '4px', color: '#FAF8F6' }}
              itemStyle={{ color: '#E5C3A6', fontWeight: 600, padding: 0 }}
              formatter={(value: any) => [`${value} ${isAr ? 'طلبات' : 'orders'}`, isAr ? 'عدد الطلبات' : 'Orders']}
            />
            <Area 
              type="monotone" 
              dataKey="orderCount" 
              stroke="#B38B6D" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorOrders)" 
              activeDot={{ r: 6, fill: '#B38B6D', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Global mounting setup
let chartRoot: any = null;

export function updateMasterChart(orders: any[], lang: string) {
  const container = document.getElementById('master-chart-root');
  if (!container) return;

  try {
    if (!chartRoot) {
      chartRoot = createRoot(container);
    }
    chartRoot.render(<MasterChart orders={orders} lang={lang} />);
  } catch (err) {
    console.error("Failed to render Recharts Master Chart:", err);
  }
}

// Attach globally
if (typeof window !== 'undefined') {
  (window as any).updateMasterChart = updateMasterChart;
}
