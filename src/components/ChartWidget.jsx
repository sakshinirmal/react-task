import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import DateTimeWidget from './DateTimeWidget'

// Mock data generator based on date range with trends
const generateChartData = (startDate, endDate, chartType, seed = Date.now()) => {
  const data = []
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const categories = ['Sales', 'Revenue', 'Users', 'Orders', 'Products']
  
  // Use seed for consistent but varied data
  const rng = (seed) => {
    let value = seed
    return () => {
      value = (value * 9301 + 49297) % 233280
      return value / 233280
    }
  }
  const random = rng(seed)

  // Base values for each category (creates trends)
  const baseValues = {
    Sales: 500,
    Revenue: 600,
    Users: 400,
    Orders: 350,
    Products: 450,
  }

  for (let i = 0; i < Math.min(days, 30); i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const entry = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
    }

    categories.forEach((category) => {
      // Add trend (slight increase over time) and random variation
      const trend = (i / days) * 200
      const variation = (random() - 0.5) * 300
      entry[category] = Math.floor(baseValues[category] + trend + variation)
    })

    data.push(entry)
  }

  return data
}

// Colors for different categories
const COLORS = {
  Sales: '#38bdf8', // cyan
  Revenue: '#10b981', // emerald
  Users: '#8b5cf6', // violet
  Orders: '#f59e0b', // amber
  Products: '#ef4444', // red
}

const COLORS_ARRAY = [
  '#38bdf8',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
]

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/20 bg-slate-900/95 p-3 shadow-lg backdrop-blur-xl">
        <p className="mb-2 font-semibold text-slate-100">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Custom Legend component
const CustomLegend = ({ payload }) => {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
      {payload.map((entry, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm"
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

const ChartWidget = () => {
  const [chartType, setChartType] = useState('bar')
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    date.setHours(0, 0, 0, 0)
    return date
  })
  const [endDate, setEndDate] = useState(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  })
  const [dataSeed, setDataSeed] = useState(Date.now())
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Generate chart data based on date range
  const chartData = useMemo(() => {
    return generateChartData(startDate, endDate, chartType, dataSeed)
  }, [startDate, endDate, chartType, dataSeed])

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      setIsLoading(true)
      setTimeout(() => {
        setDataSeed(Date.now())
        setIsLoading(false)
      }, 300)
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoRefresh])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setDataSeed(Date.now())
      setIsLoading(false)
    }, 300)
  }

  // Prepare data for Pie chart (aggregated totals)
  const pieData = useMemo(() => {
    if (chartType !== 'pie') return []
    
    const totals = {
      Sales: 0,
      Revenue: 0,
      Users: 0,
      Orders: 0,
      Products: 0,
    }

    chartData.forEach((item) => {
      Object.keys(totals).forEach((key) => {
        totals[key] += item[key] || 0
      })
    })

    return Object.entries(totals).map(([name, value], index) => ({
      name,
      value,
      color: COLORS_ARRAY[index % COLORS_ARRAY.length],
    }))
  }, [chartData, chartType])

  const handleStartDateChange = (date) => {
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    setStartDate(selectedDate)
    // Ensure start date is not after end date
    if (selectedDate > endDate) {
      setEndDate(new Date(selectedDate))
    }
  }

  const handleEndDateChange = (date) => {
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    setEndDate(selectedDate)
    // Ensure end date is not before start date
    if (selectedDate < startDate) {
      setStartDate(new Date(selectedDate))
    }
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} animationDuration={300} />
              <Legend content={<CustomLegend />} />
              <Bar 
                dataKey="Sales" 
                fill={COLORS.Sales} 
                radius={[8, 8, 0, 0]}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Bar 
                dataKey="Revenue" 
                fill={COLORS.Revenue} 
                radius={[8, 8, 0, 0]}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Bar 
                dataKey="Users" 
                fill={COLORS.Users} 
                radius={[8, 8, 0, 0]}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Bar 
                dataKey="Orders" 
                fill={COLORS.Orders} 
                radius={[8, 8, 0, 0]}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Bar 
                dataKey="Products" 
                fill={COLORS.Products} 
                radius={[8, 8, 0, 0]}
                animationDuration={500}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} animationDuration={300} />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="Sales"
                stroke={COLORS.Sales}
                strokeWidth={2}
                dot={{ fill: COLORS.Sales, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke={COLORS.Revenue}
                strokeWidth={2}
                dot={{ fill: COLORS.Revenue, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="Users"
                stroke={COLORS.Users}
                strokeWidth={2}
                dot={{ fill: COLORS.Users, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="Orders"
                stroke={COLORS.Orders}
                strokeWidth={2}
                dot={{ fill: COLORS.Orders, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="Products"
                stroke={COLORS.Products}
                strokeWidth={2}
                dot={{ fill: COLORS.Products, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={500}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationDuration={500}
                isAnimationActive={true}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-white/20 bg-slate-900/95 p-3 shadow-lg backdrop-blur-xl">
                        <p className="mb-2 font-semibold text-slate-100">
                          {payload[0].name}
                        </p>
                        <p className="text-sm text-slate-300">
                          Value: {payload[0].value.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-300">
                          Percentage: {((payload[0].value / pieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
                animationDuration={300}
              />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="relative w-full">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-100">
        Chart Widget
      </h2>

      {/* Controls Row */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
        {/* Chart Type Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Chart Type:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>

        {/* Auto-Refresh Toggle */}
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isAutoRefresh}
            onChange={(e) => setIsAutoRefresh(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-2 focus:ring-cyan-300/60"
          />
          <span className="text-sm font-medium text-slate-300">Auto Refresh</span>
        </label>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Start Date:</label>
          <div className="w-full">
            <DateTimeWidget
              dateOnly={true}
              onApply={handleStartDateChange}
              initialDate={startDate}
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-slate-300">End Date:</label>
          <div className="w-full">
            <DateTimeWidget
              dateOnly={true}
              onApply={handleEndDateChange}
              initialDate={endDate}
            />
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <svg
                className="h-6 w-6 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Updating chart...</span>
            </div>
          </div>
        )}
        <div className={isLoading ? 'opacity-50' : 'opacity-100 transition-opacity duration-300'}>
          {renderChart()}
        </div>
      </div>
    </div>
  )
}

export default ChartWidget
