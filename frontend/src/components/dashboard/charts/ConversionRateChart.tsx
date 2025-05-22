// src/components/dashboard/charts/ConversionRateChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

interface ConversionRateChartProps {
  data: {
    outcome: string;
    count: number;
  }[];
}

const COLORS = ['#4caf50', '#f44336', '#ff9800', '#9e9e9e'];

const ConversionRateChart: React.FC<ConversionRateChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // Format the data for the chart
  const formattedData = data.map(item => ({
    name: item.outcome ? item.outcome.charAt(0).toUpperCase() + item.outcome.slice(1).replace(/-/g, ' ') : 'Unknown',
    value: item.count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {formattedData.map((entry, index) => {
            let color;
            switch (entry.name.toLowerCase()) {
              case 'interested':
                color = COLORS[0];
                break;
              case 'not interested':
                color = COLORS[1];
                break;
              case 'callback':
                color = COLORS[2];
                break;
              default:
                color = COLORS[3];
            }
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Pie>
        <Tooltip formatter={(value) => [`${value} calls`, 'Count']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ConversionRateChart;
