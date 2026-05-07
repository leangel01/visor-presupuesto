import React, { useState, useMemo, useEffect, useContext, AnyActionArg } from "react";
import { Card, Select, Checkbox, Empty, Typography, Space, Row, Col } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

// Importamos el contexto de color que me proporcionaste
import { ColorModeContext } from "../../contexts/color-mode";

interface BarProgramsChrtProps {
  data: any;
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
  // Consumimos el modo actual (light o dark) del contexto
  const { mode } = useContext(ColorModeContext);

  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(true);

  // 1. Obtener programas disponibles
  const availablePrograms = useMemo(() => {
    const urData = data[selectedRamo]?.[selectedUR] || {};
    const programsSet = new Set<string>();
    Object.values(urData).forEach((yearRecords: any) => {
      yearRecords.forEach((p: any) => {
        if (p.PP_NAME) programsSet.add(p.PP_NAME);
      });
    });
    return Array.from(programsSet).map((p) => ({ label: p, value: p }));
  }, [data, selectedRamo, selectedUR]);

  // 2. Establecer valor inicial
  useEffect(() => {
    if (availablePrograms.length > 0) {
      setSelectedProgram(availablePrograms[0].value);
    } else {
      setSelectedProgram(null);
    }
  }, [availablePrograms]);

  // 3. Procesamiento de Datos (Convertidos a Millones)
  const chartData = useMemo(() => {
    if (!selectedProgram) return [];
    const urData = data[selectedRamo]?.[selectedUR] || {};

    if (showHistory) {
      return Object.keys(urData).map((year) => {
        const found = urData[year].find((p: any) => p.PP_NAME === selectedProgram);
        return {
          periodo: year,
          Aprobado: (found?.MONTO_APROBADO || 0) / 1000000,
          Modificado: (found?.MONTO_MODIFICADO || 0) / 1000000,
          Ejercido: (found?.MONTO_EJERCIDO || 0) / 1000000,
        };
      }).sort((a, b) => Number(a.periodo) - Number(b.periodo));
    } else {
      const yearRecords = urData[selectedYear.toString()] || [];
      const found = yearRecords.find((p: any) => p.PP_NAME === selectedProgram);
      if (!found) return [];
      return [{
        periodo: selectedYear.toString(),
        Aprobado: found.MONTO_APROBADO / 1000000,
        Modificado: found.MONTO_MODIFICADO / 1000000,
        Ejercido: found.MONTO_EJERCIDO / 1000000,
      }];
    }
  }, [selectedProgram, showHistory, selectedYear, data, selectedRamo, selectedUR]);

  // 4. ETIQUETAS DINÁMICAS (Color controlado por ColorModeContext)
  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined || value === 0) return null;

    // Si el modo es 'dark', usamos blanco; si no, negro.
    const labelColor = mode === "dark" ? "#ffffff" : "#000000";

    return (
      <g transform={`translate(${x + width / 2},${y - 15})`}>
        <text
          x={0}
          y={0}
          fill={labelColor}
          textAnchor="start"
          fontSize={11}
          fontWeight="normal"
          transform="rotate(-90)"
          style={{ transition: "fill 0.3s ease" }} // Transición suave de color
        >
          {`$${Number(value).toFixed(1)}M`}
        </text>
      </g>
    );
  };

  return (
    <Card
      title={
        <Row gutter={[16, 8]} align="middle" style={{ width: '100%' }}>
          <Col xs={24} md={18}>
            <Space style={{ width: '100%' }}>
              <Typography.Text strong>Programa:</Typography.Text>
              <Select
                showSearch
                placeholder="Seleccione un programa..."
                style={{ minWidth: 350, maxWidth: '98%' }}
                options={availablePrograms}
                value={selectedProgram}
                onChange={(val) => setSelectedProgram(val)}
                optionFilterProp="label"
              />
            </Space>
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Checkbox 
              checked={showHistory} 
              onChange={(e) => setShowHistory(e.target.checked)}
            >
              Datos Históricos
            </Checkbox>
          </Col>
        </Row>
      }
      style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {chartData.length > 0 ? (
        <div style={{ height: 380, width: '100%', marginTop: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 70, right: 30, left: 20, bottom: 5 }}
            >
              
              <XAxis dataKey="periodo" />
              <YAxis tickFormatter={(value) => `$${value}M`} />
              
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                formatter={(value: any, name: any) => [
                  `$${Number(value).toFixed(2)} M`, 
                  `${name}: `
                ]}
                contentStyle={{ 
                  borderRadius: '8px', 
                  backgroundColor: mode === "dark" ? "#1f1f1f" : "#fff",
                  color: mode === "dark" ? "#fff" : "#000",
                  border: "none"
                }}
              />
              
              <Legend verticalAlign="bottom" height={36}/>
              
              <Bar 
                dataKey="Aprobado" 
                fill="#1677ff" 
                radius={[4, 4, 0, 0]}
                activeBar={{ fillOpacity: 1 }}
              >
                <LabelList dataKey="Aprobado" content={renderCustomLabel} />
              </Bar>
              
              <Bar 
                dataKey="Modificado" 
                fill="#52c41a" 
                radius={[4, 4, 0, 0]}
                activeBar={{ fillOpacity: 0.7 }}
              >
                <LabelList dataKey="Modificado" content={renderCustomLabel} />
              </Bar>
              
              <Bar 
                dataKey="Ejercido" 
                fill="#f5222d" 
                radius={[4, 4, 0, 0]}
                activeBar={{ fillOpacity: 0.7 }}
              >
                <LabelList dataKey="Ejercido" content={renderCustomLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Empty description="No se encontraron datos para la selección" />
      )}
    </Card>
  );
};