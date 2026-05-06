import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import { theme } from "antd";

const { useToken } = theme;

interface ChapterData {
  CICLO: number;
  ID_CAPITULO: number;
  MONTO_EJERCIDO: number;
}

interface Props {
  data: ChapterData[];
}

const chapterNames: { [key: number]: string } = {
  1000: "Servicios Personales",
  2000: "Materiales y Suministros",
  3000: "Servicios Generales",
  4000: "Transferencias y Subsidios",
  5000: "Bienes Muebles",
  6000: "Inversión Pública",
  7000: "Inversiones Financieras",
};

const COLORS = ["#a52a2a", "#0000cd", "#6b8e23", "#808069", "#9370db", "#8a2be2", "#2e8b57"];

export const BudgetBarChart: React.FC<Props> = ({ data }) => {
  const { token } = useToken();

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.MONTO_EJERCIDO - a.MONTO_EJERCIDO) // Ordenar de mayor a menor gasto
      .map((entry) => ({
        chapter: `Cap. ${entry.ID_CAPITULO}`,
        fullName: chapterNames[entry.ID_CAPITULO] || "Otros",
        value: entry.MONTO_EJERCIDO,
      }));
  }, [data]);

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={token.colorBorderSecondary} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="chapter" 
            type="category" 
            tick={{ fill: token.colorText, fontSize: 12, fontWeight: 600 }}
            width={80}
          />
          <Tooltip
           cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} // Sombra blanca muy transparente para modo oscuro
            labelStyle={{ display: "none" }}
            formatter={(value: number, _name: string, props: any) => [
                `$${value.toLocaleString("es-MX")}`, 
                props.payload.fullName
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList 
              dataKey="value" 
              position="right" 
              formatter={(val: number) => `$${(val / 1000000).toFixed(1)}M`}
              style={{ fill: token.colorText, fontSize: 11, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};