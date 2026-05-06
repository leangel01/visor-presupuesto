import React from "react";
import { Table, Typography, Tag } from "antd";

const { Text } = Typography;

interface BudgetEntry {
  //ID_TIPOGASTO: number;
  DESC_TIPOGASTO?: string;
  MONTO_APROBADO: number;
  MONTO_MODIFICADO: number;
  MONTO_EJERCIDO: number;
}

interface BudgetTableProps {
  data: BudgetEntry[];
}

export const BudgetTable: React.FC<BudgetTableProps> = ({ data }) => {
  const formatMdp = (value: number) => 
    new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      minimumFractionDigits: 1 
    }).format(value / 1_000_000);

  const totals = data.reduce(
    (acc, curr) => ({
      APROBADO: acc.APROBADO + curr.MONTO_APROBADO,
      MODIFICADO: acc.MODIFICADO + curr.MONTO_MODIFICADO,
      EJERCICIO: acc.EJERCICIO + curr.MONTO_EJERCIDO,
    }),
    { APROBADO: 0, MODIFICADO: 0, EJERCICIO: 0 }
  );

  const columns = [
    {
      title: "Tipo de Gasto",
      dataIndex: "DESC_TIPOGASTO",
      key: "desc",
      render: (text: string, record: any) => text || `Tipo ${record.ID_TIPOGASTO}`,
    },
    {
      title: "Aprobado",
      dataIndex: "MONTO_APROBADO",
      key: "aprobado",
      align: 'center' as const,
      sorter: (a: any, b: any) => a.MONTO_APROBADO - b.MONTO_APROBADO,
      render: (val: number) => formatMdp(val),
    },
    {
      title: "%",
      key: "pct_aprobado",
      align: 'center' as const,
      render: (_: any, record: any) => 
        <Tag color="blue">{`${((record.MONTO_APROBADO / totals.APROBADO) * 100 || 0).toFixed(1)}%`}</Tag>,
    },
    {
      title: "Modificado",
      dataIndex: "MONTO_MODIFICADO",
      key: "modificado",
      align: 'center' as const,
      sorter: (a: any, b: any) => a.MONTO_MODIFICADO - b.MONTO_MODIFICADO,
      render: (val: number) => formatMdp(val),
    },
    {
      title: "%",
      key: "pct_modificado",
      align: 'center' as const,
      render: (_: any, record: any) => 
        <Tag color="orange">{`${((record.MONTO_MODIFICADO / totals.MODIFICADO) * 100 || 0).toFixed(1)}%`}</Tag>,
    },
    {
      title: "Ejercido",
      dataIndex: "MONTO_EJERCIDO",
      key: "ejercido",
      align: 'center' as const,
      sorter: (a: any, b: any) => a.MONTO_EJERCIDO - b.MONTO_EJERCIDO,
      render: (val: number) => formatMdp(val),
    },
    {
      title: "%",
      key: "pct_ejercido",
      align: 'center' as const,
      render: (_: any, record: any) => 
        <Tag color="green">{`${((record.MONTO_EJERCIDO / totals.EJERCICIO) * 100 || 0).toFixed(1)}%`}</Tag>,
    },
  ];

  const dataSource = data.map((item, index) => ({ ...item, key: index }));

  return (
    <Table 
      dataSource={dataSource} 
      columns={columns} 
      pagination={false} 
      size="small"
      bordered
      sticky // Habilita el posicionamiento fijo de encabezados y summary
      summary={() => (
        <Table.Summary fixed="top">
          <Table.Summary.Row style={{ background: 'rgba(128, 128, 128, 0.15)', backdropFilter: 'blur(4px)' }}>
            <Table.Summary.Cell index={0}><Text strong>TOTAL</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: '#1890ff' }}>{formatMdp(totals.APROBADO)}</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="center"><Tag color="blue" style={{ fontWeight: 'bold' }}>100%</Tag></Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right"><Text strong style={{ color: '#fa8c16' }}>{formatMdp(totals.MODIFICADO)}</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="center"><Tag color="orange" style={{ fontWeight: 'bold' }}>100%</Tag></Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right"><Text strong style={{ color: '#52c41a' }}>{formatMdp(totals.EJERCICIO)}</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="center"><Tag color="green" style={{ fontWeight: 'bold' }}>100%</Tag></Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
};