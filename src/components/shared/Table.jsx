import { formatCurrency, formatNumber } from '../../utils/formatters';

export const Table = ({ data, columns }) => {
  const formatCell = (value, format) => {
    if (format === 'currency') return formatCurrency(value);
    if (format === 'number') return formatNumber(value);
    if (format === 'percent') return `${value}%`;
    return value;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map(col => (
                <td key={col.key}>
                  {formatCell(row[col.key], col.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
