import React, { useState, useMemo } from "react";
import { Card, Select, Checkbox, Empty, Typography } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgramRecord {
  PP_NAME: string;
  MONTO_APROBADO: number;
  MONTO_MODIFICADO: number;
  MONTO_EJERCIDO: number;
  year?: string; // Atributo virtual para el modo histórico
}

interface BarProgramsChrtProps {
  data: any; // El JSON completo de programas
  selectedRamo: string;
  selectedUR: string;
  selectedYear: number;
}

export const BarProgramsChrt: React.FC<BarProgramsChrtProps> = ({
  data,
  selectedRamo,
  selectedUR,
  selectedYear,
}) => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // 1. Obtener todos los programas disponibles para la UR actual (independiente del año)
  const availablePrograms = useMemo(() => {
    const urData = data[selectedRamo]?.[selectedUR] || {};
    const programsSet = new Set<string>();
    Object.values(urData).forEach((yearRecords: any) => {
      yearRecords.forEach((p: any) => programsSet.add(p.PP_NAME));
    });
    return Array.from(programsSet).map((p) => ({ label: p, value: p }));
  }, [data, selectedRamo, selectedUR]);

  // 2. Procesar datos para el gráfico
  const chartData = useMemo(() => {
    if (!selectedProgram) return [];

    const urData = data[selectedRamo]?.[selectedUR] || {};

    if (showHistory) {
      // MODO HISTÓRICO: Recolectar datos de todos los años para el programa seleccionado
      return Object.keys(urData).map((year) => {
        const found = urData[year].find((p: any) => p.PP_NAME === selectedProgram);
        return {
          periodo: year,
          Aprobado: found?.MONTO_APROBADO || 0,
          Modificado: found?.MONTO_MODIFICADO || 0,
          Ejercido: found?.MONTO_EJERCIDO || 0,
        };
      }).sort((a, b) => Number(a.periodo) - Number(b.periodo));
    } else {
      // MODO ANUAL: Solo los montos del año seleccionado
      const yearRecords = urData[selectedYear.toString()] || [];
      const found = yearRecords.find((p: any) => p.PP_NAME === selectedProgram);
      if (!found) return [];
      return [
        {
          periodo: selectedYear.toString(),
          Aprobado: found.MONTO_APROBADO,
          Modificado: found.MONTO_MODIFICADO,
          Ejercido: found.MONTO_EJERCIDO,
        },
      ];
    }
  }, [selectedProgram, showHistory, selectedYear, data, selectedRamo, selectedUR]);

  const periodoTitulo = showHistory ? "Histórico" : selectedYear.toString();

  return (
    <Card
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <Typography.Text strong>
            {selectedProgram ? `${selectedProgram} - ${periodoTitulo}` : "Seleccione un Programa"}
          </Typography.Text>
          <Checkbox 
            checked={showHistory} 
            onChange={(e) => setShowHistory(e.target.checked)}
          >
            Datos Históricos
          </Checkbox>
        </div>
      }
      style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      <div style={{ marginBottom: "20px" }}>
        <Typography.Text>Programa: </Typography.Text>
        <Select
          showSearch
          placeholder="Buscar programa..."
          style={{ width: "100%" }}
          options={availablePrograms}
          value={selectedProgram}
          onChange={(val) => setSelectedProgram(val)}
          optionFilterProp="label"
        />
      </div>

      {chartData.length > 0 ? (
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="periodo" />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip formatter={(value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)} />
              <Legend />
              <Bar dataKey="Aprobado" fill="#1890ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Modificado" fill="#52c41a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ejercido" fill="#faad14" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Empty description="No hay datos para el programa/año seleccionado" />
      )}
    </Card>
  );
};