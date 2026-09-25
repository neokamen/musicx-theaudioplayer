import type { LayoutNode } from "../../types/layout.ts";

export const DEFAULT_LAYOUT: LayoutNode = {
  id: "root",
  type: "split",
  direction: "horizontal",
  sizes: [22, 48, 30],
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
      sizes: [38, 32, 30],
      children: [
        {
          id: "panel-right-top",
          type: "leaf",
          widget: "cover",
        },
        {
          id: "panel-right-mid",
          type: "leaf",
          widget: "inspector",
        },
        {
          id: "panel-right-bottom",
          type: "leaf",
          widget: "dac_telemetry",
        },
      ],
    },
  ],
};

const STORAGE_KEY = "musicx_layout_config_v9";

function hasOldOrInvalidWidgets(node: LayoutNode): boolean {
  if (node.type === "leaf") {
    // If it's the old combined widget or missing cover, force clean default
    return (node.widget as string) === "cover_inspector";
  }
  if (node.type === "split" && node.children) {
    return node.children.some(hasOldOrInvalidWidgets);
  }
  return false;
}

export function loadLayoutFromStorage(): LayoutNode {
  try {
    // Clear old versions from localStorage
    localStorage.removeItem("musicx_layout_config_v1");
    localStorage.removeItem("musicx_layout_config_v2");
    localStorage.removeItem("musicx_layout_config_v3");
    localStorage.removeItem("musicx_layout_config_v4");
    localStorage.removeItem("musicx_layout_config_v5");

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LayoutNode;
      if (parsed && parsed.id && parsed.type && !hasOldOrInvalidWidgets(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Usando layout por defecto:", e);
  }
  return DEFAULT_LAYOUT;
}

export function saveLayoutToStorage(layout: LayoutNode): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (e) {
    console.error("Error al guardar layout:", e);
  }
}

export function resetLayoutStorage(): LayoutNode {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("musicx_layout_config_v1");
    localStorage.removeItem("musicx_layout_config_v2");
    localStorage.removeItem("musicx_layout_config_v3");
    localStorage.removeItem("musicx_layout_config_v4");
    localStorage.removeItem("musicx_layout_config_v5");
  } catch {
    // Ignore
  }
  return DEFAULT_LAYOUT;
}

export const loadStoredLayout = loadLayoutFromStorage;
export const saveStoredLayout = saveLayoutToStorage;
