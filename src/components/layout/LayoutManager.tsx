import React, { useState, useEffect } from "react";
import type { LayoutNode, WidgetType } from "../../types/layout.ts";
import {
  DEFAULT_LAYOUT,
  loadLayoutFromStorage,
  saveLayoutToStorage,
  resetLayoutStorage,
} from "./defaultLayout.ts";
import { LayoutNodeRenderer } from "./LayoutNodeRenderer.tsx";
import { Sliders, RotateCcw, Check } from "lucide-react";

export const LayoutManager: React.FC = () => {
  const [layout, setLayout] = useState<LayoutNode>(loadLayoutFromStorage);
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
    resetLayoutStorage();
    setLayout(DEFAULT_LAYOUT);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden select-none bg-audiophile-base">
      {/* Barra de control para Modo Edición */}
      <div className="h-8 px-4 border-b border-audiophile-border bg-audiophile-surface flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-audiophile-muted uppercase tracking-wider">
            Arquitectura de Paneles:
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-audiophile-surface2 border border-audiophile-border text-audiophile-cyan">
            Ventanas Modulares
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleResetLayout}
              className="px-2.5 py-1 rounded bg-audiophile-surface2 hover:bg-audiophile-border text-[11px] font-mono text-audiophile-muted hover:text-white transition-colors flex items-center gap-1.5"
              title="Restaurar layout predeterminado de 3 columnas"
            >
              <RotateCcw size={12} />
              <span>Restablecer</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1.5 active:scale-95 ${
              isEditing
                ? "bg-audiophile-cyan text-audiophile-base font-bold shadow-lg shadow-audiophile-cyan/20"
                : "bg-audiophile-surface2 hover:bg-audiophile-border text-audiophile-text border border-audiophile-border"
            }`}
          >
            {isEditing ? (
              <>
                <Check size={12} />
                <span>Guardar Layout</span>
              </>
            ) : (
              <>
                <Sliders size={12} />
                <span>Editar Interfaz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Árbol de Paneles Redimensionables */}
      <div className="flex-1 w-full h-[calc(100%-2rem)] overflow-hidden">
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
