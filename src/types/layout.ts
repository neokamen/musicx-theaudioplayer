export type WidgetType =
  | "folder_explorer"
  | "tracklist"
  | "cover"
  | "inspector"
  | "eq_bars"
  | "dac_telemetry"
  | "queue";

export interface WidgetMeta {
  type: WidgetType;
  label: string;
  description: string;
}

export const AVAILABLE_WIDGETS: WidgetMeta[] = [
  {
    type: "folder_explorer",
    label: "Explorador de Carpetas",
    description: "Navegación lazy ultra-rápida (Local / NFS / SSHFS)",
  },
  {
    type: "tracklist",
    label: "Lista de Biblioteca / Canciones",
    description: "Listado de canciones con búsqueda rápida e indexado SQLite",
  },
  {
    type: "cover",
    label: "Carátula del Álbum",
    description: "Visualización de portada de alta fidelidad y fallback Hi-Fi",
  },
  {
    type: "inspector",
    label: "Inspector Técnico & Códec",
    description: "Inspección de tags de archivo, códec, bit-depth y metadatos",
  },
  {
    type: "eq_bars",
    label: "Barras de Ecualizador Gráfico",
    description: "Visualización de 10 bandas y controles de ganancia DSP",
  },
  {
    type: "dac_telemetry",
    label: "Telemetría Hi-Fi & DAC",
    description: "Estado ALSA/PipeWire, stream bit-perfect y medidor dinámico",
  },
  {
    type: "queue",
    label: "Cola de Reproducción",
    description: "Lista de pistas en cola para reproducción continua gapless",
  },
];

export type LayoutNode =
  | {
      id: string;
      type: "leaf";
      widget: WidgetType;
    }
  | {
      id: string;
      type: "split";
      direction: "horizontal" | "vertical";
      children: LayoutNode[];
      sizes: number[];
    };
