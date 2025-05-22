// src/components/dashboard/charts/CallMetricsChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

interface CallMetricsChartProps {
  data: {
    status: string;
    count: number;
  }[];
}

const CallMetricsChart: React.FC<CallMetricsChartProps> = ({ data }) => {
  const theme = useTheme();
  
  // Format the data for the chart
  const formattedData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name="Calls" fill={theme.palette.primary.main} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CallMetricsChart;
