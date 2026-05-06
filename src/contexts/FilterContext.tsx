import React, { createContext, useState, useEffect, ReactNode } from 'react';
import dataJson from '../data/visor_presupuesto.json';
import { PresupuestoData, Historico, CatalogoEntidad } from '../types/budget';

const data = dataJson as unknown as PresupuestoData;

export const FilterContext = createContext<any>({});

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [ramoSelected, setRamoSelected] = useState<string>('');
  const [urSelected, setUrSelected] = useState<string>('');
  const [ramos, setRamos] = useState<string[]>([]);
  const [instituciones, setInstituciones] = useState<{id: string, nombre: string}[]>([]);
  const [chartData, setChartData] = useState<Historico[]>([]);

  // Cargar Ramos al inicio
  useEffect(() => {
    if (data?.catalogo_maestro) {
      const lista = Array.from(new Set(data.catalogo_maestro.map(i => i.ramo_actual))).sort();
      setRamos(lista);
    }
  }, []);

  // Actualizar Instituciones cuando cambie el Ramo
  useEffect(() => {
    if (ramoSelected) {
      const filtradas = data.catalogo_maestro
        .filter(i => i.ramo_actual === ramoSelected)
        .map(i => ({ id: i.id_entidad, nombre: i.nombre_actual }));
      setInstituciones(filtradas);
    } else {
      setInstituciones([]);
    }
    setUrSelected('');
  }, [ramoSelected]);

  // Actualizar Gráfico cuando cambie la Institución
  useEffect(() => {
    if (urSelected && data.datos[urSelected]) {
      setChartData(data.datos[urSelected].historico);
    } else {
      setChartData([]);
    }
  }, [urSelected]);

  return (
    <FilterContext.Provider value={{
      ramos, instituciones, ramoSelected, setRamoSelected,
      urSelected, setUrSelected, chartData
    }}>
      {children}
    </FilterContext.Provider>
  );
};