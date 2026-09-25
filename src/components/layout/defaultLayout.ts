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

const STORAGE_KEY = "musicx_layout_config_v2";

export function loadStoredLayout(): LayoutNode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to parse saved layout from localStorage:", err);
  }
  return DEFAULT_LAYOUT;
}

export function saveStoredLayout(layout: LayoutNode): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (err) {
    console.error("Failed to save layout into localStorage:", err);
  }
}

export function resetLayoutStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

export const loadLayoutFromStorage = loadStoredLayout;
export const saveLayoutToStorage = saveStoredLayout;
