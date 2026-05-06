import React, { useState, useMemo } from "react";
import { Card, Select, Row, Col, Typography, Space, Affix } from "antd";

// Importación de componentes modulares existentes
import { BudgetChart } from "../../components/charts/BudgetChart";
import { BudgetBarChart } from "../../components/charts/BudgetBarChart"; 
import { BudgetTable } from "../../components/tables/BudgetTable";

// NUEVA IMPORTACIÓN: Componente de programas
import { BarProgramsChrt } from "../../components/charts/bar_programs_chrt";

// Importación de fuentes de datos originales
import budgetDataRaw from "../../data/budgetData.json";
import budgetByChapterRaw from "../../data/budgetByChapterData.json";
import budgetByTypeRaw from "../../data/datos_cuenta_publica_Tabla_TG_2.json"; 

// NUEVA IMPORTACIÓN: Datos de programas
import programsDataRaw from "../../data/datos_programas.json";

const { Title, Text } = Typography;

// --- DEFINICIÓN DE INTERFACES PARA TIPADO ---
interface BudgetJSON {
  [ramo: string]: { [ur: string]: Array<any> };
}

interface ChapterJSON {
  [ramo: string]: {
    [ur: string]: Array<{
      CICLO: number;
      ID_CAPITULO: number;
      EJERCICIO: number;
    }>;
  };
}

interface TypeBudgetJSON {
  [ramo: string]: { 
    [ur: string]: { 
      [año: string]: Array<{
        ID_TIPOGASTO: number;
        DESC_TIPOGASTO?: string;
        MONTO_APROBADO: number;
        MONTO_MODIFICADO: number;
        EJERCICIO: number;
      }> 
    } 
  };
}

// Casteo de datos a sus interfaces correspondientes
const budgetData = budgetDataRaw as BudgetJSON;
const budgetByChapterData = budgetByChapterRaw as ChapterJSON;
const budgetByTypeData = budgetByTypeRaw as TypeBudgetJSON;

export const BoardView: React.FC = () => {
  // --- ESTADOS DE FILTROS ---
  const initialRamo = Object.keys(budgetData)[0];
  const initialUR = Object.keys(budgetData[initialRamo])[0];

  const [selectedRamo, setSelectedRamo] = useState<string>(initialRamo);
  const [selectedUR, setSelectedUR] = useState<string>(initialUR);

  // Años disponibles basados en la estructura de capítulos
  const availableYears = useMemo(() => {
    const records = budgetByChapterData[selectedRamo]?.[selectedUR] || [];
    const years = [...new Set(records.map(r => r.CICLO))].sort((a, b) => b - a);
    return years;
  }, [selectedRamo, selectedUR]);

  const [selectedYearForChart, setSelectedYearForChart] = useState<number>(availableYears[0] || 2024);

  // --- OPCIONES PARA LOS SELECTS ---
  const ramoOptions = useMemo(() => Object.keys(budgetData).map(ramo => ({ label: `Ramo ${ramo}`, value: ramo })), []);
  const urOptions = useMemo(() => Object.keys(budgetData[selectedRamo] || {}).map(ur => ({ label: ` ${ur}`, value: ur })), [selectedRamo]);
  const yearOptions = useMemo(() => availableYears.map(year => ({ label: `Año ${year}`, value: year })), [availableYears]);

  // --- MANEJADORES DE CAMBIO ---
  const handleRamoChange = (value: string) => {
    setSelectedRamo(value);
    const urKeys = Object.keys(budgetData[value] || {});
    const firstUR = urKeys[0];
    setSelectedUR(firstUR);
    actualizarAñoDefecto(value, firstUR);
  };

  const handleURChange = (value: string) => {
    setSelectedUR(value);
    actualizarAñoDefecto(selectedRamo, value);
  };

  const actualizarAñoDefecto = (ramo: string, ur: string) => {
    const newRecords = budgetByChapterData[ramo]?.[ur] || [];
    const newYears = [...new Set(newRecords.map(r => r.CICLO))].sort((a, b) => b - a);
    setSelectedYearForChart(newYears[0] || 2024);
  };

  // --- FILTRADO DE DATOS PARA COMPONENTES ---

  // 1. Datos para gráfico de líneas (Histórico UR)
  const currentLineChartData = useMemo(() => budgetData[selectedRamo]?.[selectedUR] || [], [selectedRamo, selectedUR]);
  
  // 2. Datos para gráfico de barras (Capítulos por año)
  const currentBarChartData = useMemo(() => {
    const allRecords = budgetByChapterData[selectedRamo]?.[selectedUR] || [];
    return allRecords.filter(record => record.CICLO === selectedYearForChart);
  }, [selectedRamo, selectedUR, selectedYearForChart]);

  // 3. Datos para la nueva Tabla (Tipo de Gasto por año)
  const currentTableData = useMemo(() => {
    return budgetByTypeData[selectedRamo]?.[selectedUR]?.[selectedYearForChart.toString()] || [];
  }, [selectedRamo, selectedUR, selectedYearForChart]);

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        
        {/* PANEL DE FILTROS */}
        <Affix offsetTop={64}>
        <Card size="small" style={{ borderRadius: '8px', borderTop: '4px solid #1890ff',boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Title level={4} style={{ margin: 0 }}>Visor Presupuestario</Title>
            </Col>
            {/* SELECTOR DE RAMO */}
            <Col xs={24} md={6}>
              <Text strong>Ramo: </Text>
              <Select style={{ width: "100%" }} options={ramoOptions} value={selectedRamo} onChange={handleRamoChange} />
            </Col>
            {/* SELECTOR DE UNIDAD RESPONSABLE */}
            <Col xs={24} md={6}>
              <Text strong>UR: </Text>
              <Select 
                showSearch 
                style={{ width: "100%" }} 
                options={urOptions} 
                value={selectedUR} 
                onChange={handleURChange}
                placeholder="Buscar UR"
                optionFilterProp="label"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Col>
            {/* SELECTOR DE AÑO PARA GRÁFICOS INFERIORES */}
            <Col xs={24} md={6}>
              <Text strong>Ciclo seleccionado: </Text>
              <Select style={{ width: "100%" }} options={yearOptions} value={selectedYearForChart} onChange={setSelectedYearForChart} />
            </Col>
          </Row>
        </Card>
        </Affix>

        {/* 1. SECCIÓN SUPERIOR: TENDENCIA HISTÓRICA */}
        <Row>
          <Col span={24}>
            <Card 
              title={`Evolución del Gasto: Ramo ${selectedRamo} - UR ${selectedUR}`}
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <BudgetChart data={currentLineChartData} />
            </Card>
          </Col>
        </Row>

        {/* 2. SECCIÓN INFERIOR: DESGLOSE POR CAPÍTULO Y TIPO DE GASTO */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card 
              title={`Gasto por Capítulo (${selectedYearForChart})`}
              style={{ borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <BudgetBarChart data={currentBarChartData} />
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card 
              title={`Análisis por Tipo de Gasto, (${selectedYearForChart})`}
              style={{ borderRadius: '8px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <BudgetTable data={currentTableData} />
            </Card>
          </Col>
        </Row>

        {/* 3. NUEVA SECCIÓN: GRÁFICO POR PROGRAMAS (Implementado según requerimiento) */}
        <Row>
          <Col span={24}>
            <BarProgramsChrt 
              data={programsDataRaw}
              selectedRamo={selectedRamo}
              selectedUR={selectedUR}
              selectedYear={selectedYearForChart}
            />
          </Col>
        </Row>

      </Space>
    </div>
  );
};