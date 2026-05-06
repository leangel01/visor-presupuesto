import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface BudgetData {
  CICLO: number;
  MONTO_APROBADO: number;
  MONTO_MODIFICADO: number;
  MONTO_EJERCIDO: number;
}

// Componente para la flecha y el porcentaje (Variación vs Año Anterior)
const YearlyVariationLabel = (props: any) => {
  const { x, y, index, data } = props;

  // 1. Validamos que data exista y que los índices actual y anterior tengan datos
  if (!data || !data[index] || index === 0 || !data[index - 1]) {
    return null;
  }

  const valorActual = data[index].MONTO_MODIFICADO;
  const valorAnterior = data[index - 1].MONTO_MODIFICADO;

  // 2. Evitamos división por cero o valores nulos
  if (valorAnterior === 0 || valorActual === undefined || valorAnterior === undefined) {
    return null;
  }

  const variacion = ((valorActual / valorAnterior) - 1) * 100;
  const esPositiva = variacion >= 0;
  const color = esPositiva ? "#52c41a" : "#f5222d";
  const flecha = esPositiva ? "▲" : "▼";

  return (
    <g>
      <text
        x={x}
        y={y}
        dy={-20}
        fill={color}
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        {`${flecha} ${Math.abs(variacion).toFixed(1)}%`}
      </text>
    </g>
  );
};

export const BudgetChart: React.FC<{ data: BudgetData[] }> = ({ data }) => {
  // Ordenar datos por ciclo para asegurar que la comparativa sea cronológica
  const sortedData = [...data].sort((a, b) => a.CICLO - b.CICLO);

  const formatYAxis = (value: number) => `$${(value / 1000000).toLocaleString()}M`;

  return (
    <div style={{ width: "100%", height: 450, marginTop: "20px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={sortedData} 
          margin={{ top: 40, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey="CICLO" />
          <YAxis tickFormatter={formatYAxis} width={90} axisLine={false} />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Monto"]} 
          />
          <Legend verticalAlign="top" height={36} />

          <Line
            name="P. Aprobado"
            type="monotone"
            dataKey="MONTO_APROBADO"
            stroke="#1677ff"
            strokeWidth={2}
            dot={{ r: 4 }}
          />

          <Line
            name="P. Modificado"
            type="monotone"
            dataKey="MONTO_MODIFICADO"
            stroke="#52c41a"
            strokeWidth={4}
            dot={{ r: 6, fill: "#52c41a" }}
          >
            {/* Etiquetas de variación interanual */}
            <LabelList 
              content={(props) => <YearlyVariationLabel {...props} data={sortedData} />}
            />
          </Line>

          <Line
            name="P. Ejercido"
            type="monotone"
            dataKey="MONTO_EJERCIDO"
            stroke="#f5222d"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};