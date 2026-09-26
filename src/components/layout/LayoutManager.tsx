import React, { useState, useEffect } from "react";
import type { LayoutNode, WidgetType } from "../../types/layout.ts";
import {
  DEFAULT_LAYOUT,
  LAYOUT_PRESETS,
  loadLayoutFromStorage,
  saveLayoutToStorage,
  resetLayoutStorage,
} from "./defaultLayout.ts";
import { LayoutNodeRenderer } from "./LayoutNodeRenderer.tsx";
import { RotateCcw } from "lucide-react";

interface LayoutManagerProps {
  isEditing: boolean;
}

export const LayoutManager: React.FC<LayoutManagerProps> = ({ isEditing }) => {
  const [layout, setLayout] = useState<LayoutNode>(loadLayoutFromStorage);

  useEffect(() => {
    saveLayoutToStorage(layout);
  }, [layout]);

  // División de nodo (horizontal o vertical)
  const handleSplit = (targetId: string, direction: "horizontal" | "vertical") => {
    const splitRecursive = (current: LayoutNode): LayoutNode => {
      if (current.id === targetId && current.type === "leaf") {
        const newChild1: LayoutNode = {
          id: `leaf-${Date.now()}-1`,
          type: "leaf",
          widget: current.widget,
        };
        const newChild2: LayoutNode = {
          id: `leaf-${Date.now()}-2`,
          type: "leaf",
          widget: "tracklist",
        };

        return {
          id: `split-${Date.now()}`,
          type: "split",
          direction,
          sizes: [50, 50],
          children: [newChild1, newChild2],
        };
      }

      if (current.type === "split") {
        return {
          ...current,
          children: current.children.map(splitRecursive),
        };
      }

      return current;
    };

    setLayout((prev) => splitRecursive(prev));
  };

  // Eliminación de un nodo leaf
  const handleRemove = (targetId: string) => {
    const removeRecursive = (current: LayoutNode): LayoutNode | null => {
      if (current.id === targetId) {
        return null;
      }

      if (current.type === "split") {
        const remaining = current.children
          .map(removeRecursive)
          .filter((c): c is LayoutNode => c !== null);

        if (remaining.length === 0) return null;
        if (remaining.length === 1) return remaining[0];

        // Recalcular tamaños de manera proporcional
        const newSizes = remaining.map(() => 100 / remaining.length);
        return {
          ...current,
          children: remaining,
          sizes: newSizes,
        };
      }

      return current;
    };

    setLayout((prev) => {
      const updated = removeRecursive(prev);
      return updated ?? DEFAULT_LAYOUT;
    });
  };

  // Cambio de widget asignado
  const handleChangeWidget = (targetId: string, widget: WidgetType) => {
    const updateRecursive = (current: LayoutNode): LayoutNode => {
      if (current.id === targetId && current.type === "leaf") {
        return { ...current, widget };
      }

      if (current.type === "split") {
        return {
          ...current,
          children: current.children.map(updateRecursive),
        };
      }

      return current;
    };

    setLayout((prev) => updateRecursive(prev));
  };

  // Redimensionamiento de paneles
  const handleResize = (targetId: string, sizes: number[]) => {
    const resizeRecursive = (current: LayoutNode): LayoutNode => {
      if (current.id === targetId && current.type === "split") {
        return { ...current, sizes };
      }

      if (current.type === "split") {
        return {
          ...current,
          children: current.children.map(resizeRecursive),
        };
      }

      return current;
    };

    setLayout((prev) => resizeRecursive(prev));
  };

  const handleResetLayout = () => {
    const reset = resetLayoutStorage();
    setLayout(reset);
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden select-none bg-audiophile-base">
      {isEditing && (
        <div className="absolute right-3 top-3 z-40 flex items-center gap-2">
          <select
            defaultValue=""
            onChange={(event) => {
              const preset = LAYOUT_PRESETS.find((item) => item.id === event.target.value);
              if (preset) setLayout(JSON.parse(JSON.stringify(preset.layout)) as LayoutNode);
              event.currentTarget.value = "";
            }}
            className="rounded border border-audiophile-border bg-audiophile-surface2/95 px-2 py-1 text-[11px] font-mono text-audiophile-text"
            aria-label="Aplicar preset de interfaz"
          >
            <option value="" disabled>Layouts</option>
            {LAYOUT_PRESETS.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
          </select>
          <button
            onClick={handleResetLayout}
            className="flex items-center gap-1.5 rounded border border-audiophile-border bg-audiophile-surface2/90 px-2 py-1 text-[11px] font-mono text-audiophile-muted hover:text-white"
            title="Restaurar layout predeterminado"
          >
            <RotateCcw size={12} />
            <span>Restablecer</span>
          </button>
        </div>
      )}
      <div className="h-full w-full overflow-hidden">
        <LayoutNodeRenderer
          node={layout}
          isEditing={isEditing}
          onSplit={handleSplit}
          onRemove={handleRemove}
          onChangeWidget={handleChangeWidget}
          onResize={handleResize}
        />
      </div>
    </div>
  );
};
