export interface Historico {
  ciclo: number;
  aprobado: number;
  modificado: number;
  ejercido: number;
}

export interface CatalogoEntidad {
  ramo_actual: string;
  nombre_actual: string;
  id_entidad: string;
}

export interface PresupuestoData {
  catalogo_maestro: CatalogoEntidad[];
  datos: {
    [key: string]: {
      historico: Historico[];
    };
  };
}