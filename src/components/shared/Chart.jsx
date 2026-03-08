import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Chart = ({ data, type = 'line', dataKeys, colors, xKey = 'ano', height = 400 }) => {
  const ChartComponent = type === 'area' ? AreaChart : type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'area' ? Area : type === 'bar' ? Bar : Line;

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--bg-secondary)', 
              border: '2px solid var(--border)',
              borderRadius: '8px'
            }} 
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <DataComponent
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[index]}
              fill={colors[index]}
              strokeWidth={2}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};
