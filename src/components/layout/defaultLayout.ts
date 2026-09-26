import type { LayoutNode } from "../../types/layout.ts";

export const DEFAULT_LAYOUT: LayoutNode = {
  id: "root",
  type: "split",
  direction: "horizontal",
  sizes: [22, 46, 32],
  children: [
    {
      id: "panel-left",
      type: "leaf",
      widget: "folder_explorer",
    },
    {
      id: "panel-center",
      type: "leaf",
      widget: "tracklist",
    },
    {
      id: "panel-right",
      type: "split",
      direction: "vertical",
      sizes: [30, 24, 24, 22],
      children: [
        {
          id: "panel-right-cover",
          type: "leaf",
          widget: "cover",
        },
        {
          id: "panel-right-inspector",
          type: "leaf",
          widget: "inspector",
        },
        {
          id: "panel-right-spectrum",
          type: "leaf",
          widget: "cava_visualizer",
        },
        {
          id: "panel-right-dac",
          type: "leaf",
          widget: "dac_telemetry",
        },
      ],
    },
  ],
};

export const LAYOUT_PRESETS: { id: string; label: string; layout: LayoutNode }[] = [
  { id: "default", label: "Tres columnas", layout: DEFAULT_LAYOUT },
  {
    id: "wide-library",
    label: "Biblioteca amplia",
    layout: {
      id: "preset-wide",
      type: "split",
      direction: "horizontal",
      sizes: [24, 76],
      children: [
        { id: "preset-wide-explorer", type: "leaf", widget: "folder_explorer" },
        { id: "preset-wide-tracks", type: "leaf", widget: "tracklist" },
      ],
    },
  },
  {
    id: "cava-studio",
    label: "Estudio CAVA",
    layout: {
      id: "preset-cava",
      type: "split",
      direction: "horizontal",
      sizes: [68, 32],
      children: [
        { id: "preset-cava-tracks", type: "leaf", widget: "tracklist" },
        {
          id: "preset-cava-side",
          type: "split",
          direction: "vertical",
          sizes: [58, 42],
          children: [
            { id: "preset-cava-visual", type: "leaf", widget: "cava_visualizer" },
            { id: "preset-cava-queue", type: "leaf", widget: "queue" },
          ],
        },
      ],
    },
  },
  {
    id: "explorer-visual",
    label: "Explorador + visualización",
    layout: {
      id: "preset-explorer",
      type: "split",
      direction: "horizontal",
      sizes: [38, 62],
      children: [
        { id: "preset-explorer-files", type: "leaf", widget: "folder_explorer" },
        {
          id: "preset-explorer-right",
          type: "split",
          direction: "vertical",
          sizes: [68, 32],
          children: [
            { id: "preset-explorer-tracks", type: "leaf", widget: "tracklist" },
            { id: "preset-explorer-cava", type: "leaf", widget: "cava_visualizer" },
          ],
        },
      ],
    },
  },
];

const STORAGE_KEY = "musicx_layout_config_v16";

export function loadLayoutFromStorage(): LayoutNode {
  try {
    for (let i = 1; i <= 15; i++) {
      localStorage.removeItem(`musicx_layout_config_v${i}`);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LayoutNode;
      if (parsed && parsed.id && parsed.type) {
        const migrateCavaPanel = (node: LayoutNode): LayoutNode => {
          if (node.type === "leaf") {
            return node.id === "panel-right-spectrum" && node.widget === "spectrum"
              ? { ...node, widget: "cava_visualizer" }
              : node;
          }
          return { ...node, children: node.children.map(migrateCavaPanel) };
        };
        return migrateCavaPanel(parsed);
      }
    }
  } catch (e) {
    console.warn("No se pudo cargar el layout guardado. Usando layout por defecto:", e);
  }
  return DEFAULT_LAYOUT;
}

export function saveLayoutToStorage(layout: LayoutNode): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (e) {
    console.error("Error al guardar layout en localStorage:", e);
  }
}

export function resetLayoutStorage(): LayoutNode {
  try {
    for (let i = 1; i <= 16; i++) {
      localStorage.removeItem(`musicx_layout_config_v${i}`);
    }
  } catch {
    // Ignore
  }
  return DEFAULT_LAYOUT;
}
