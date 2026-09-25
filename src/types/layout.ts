export type WidgetType =
  | "folder_explorer"
  | "tracklist"
  | "cover"
  | "inspector"
  | "dac_telemetry"
  | "eq_bars"
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
    label: "Lista de Canciones / Biblioteca",
    description: "Listado de canciones con búsqueda rápida e indexado SQLite",
  },
  {
    type: "cover",
    label: "Carátula del Álbum",
    description: "Visualización de portada y arte del disco a alta resolución",
  },
  {
    type: "inspector",
    label: "Inspector Técnico & Metadatos",
    description: "Inspección de tags de archivo, códec, bit-depth y parámetros PCM",
  },
  {
    type: "dac_telemetry",
    label: "Telemetría Hi-Fi & DAC",
    description: "Estado ALSA/PipeWire, stream bit-perfect y espectro a tiempo real",
  },
  {
    type: "eq_bars",
    label: "Visualizador / Barras EQ",
    description: "Barras dinámicas del ecualizador y respuesta en frecuencia",
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
