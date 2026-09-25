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
          widget: "spectrum",
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

const STORAGE_KEY = "musicx_layout_config_v15";

export function loadLayoutFromStorage(): LayoutNode {
  try {
    for (let i = 1; i <= 14; i++) {
      localStorage.removeItem(`musicx_layout_config_v${i}`);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LayoutNode;
      if (parsed && parsed.id && parsed.type) {
        return parsed;
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
    for (let i = 1; i <= 15; i++) {
      localStorage.removeItem(`musicx_layout_config_v${i}`);
    }
  } catch {
    // Ignore
  }
  return DEFAULT_LAYOUT;
}
