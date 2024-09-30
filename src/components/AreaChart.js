import React from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function AreaChartComponent({ data, dataKeys, title, xAxisDataKey }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <XAxis
            dataKey={xAxisDataKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}°C`}
          />
          <Tooltip />
          {dataKeys.map((key, index) => (
            <Area
              key={key.dataKey}
              type="monotone"
              dataKey={key.dataKey}
              stroke={key.stroke}
              fill={key.fill}
              fillOpacity={0.2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
