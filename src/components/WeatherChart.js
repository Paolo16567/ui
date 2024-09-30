import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeatherChart = ({ historicalData, currentTemp }) => {
  // Prepara i dati per il grafico
  const chartData = [
    ...historicalData.map(item => ({
      time: new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperatura: item.temp,
    })),
    { time: 'Ora', temperatura: currentTemp }
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="temperatura" stroke="#8884d8" name="Temperatura (°C)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeatherChart;
