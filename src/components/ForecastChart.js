import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastChart = ({ forecastData }) => {
  const getDayName = (addDays = 0) => {
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    const date = new Date();
    date.setDate(date.getDate() + addDays);
    return days[date.getDay()];
  };

  const data = forecastData.map((day, index) => ({
    name: getDayName(index + 1),
    max: day.temp_max,
    min: day.temp_min,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="max" stroke="#ff7300" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="min" stroke="#387908" />
      </LineChart>
    </ResponsiveContainer>
  );
};
export default ForecastChart;
