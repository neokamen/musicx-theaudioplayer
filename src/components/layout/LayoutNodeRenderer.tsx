import React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { LayoutNode, WidgetType } from "../../types/layout.ts";
import { AVAILABLE_WIDGETS } from "../../types/layout.ts";
import { WidgetRenderer } from "../widgets/WidgetRenderer.tsx";
import {
  Columns,
  Rows,
  Trash2,
  GripVertical,
  GripHorizontal,
} from "lucide-react";

interface LayoutNodeRendererProps {
  node: LayoutNode;
  isEditing: boolean;
  onSplit: (targetId: string, direction: "horizontal" | "vertical") => void;
  onRemove: (targetId: string) => void;
  onChangeWidget: (targetId: string, widget: WidgetType) => void;
  onResize: (targetId: string, sizes: number[]) => void;
}

export const LayoutNodeRenderer: React.FC<LayoutNodeRendererProps> = ({
  node,
  isEditing,
  onSplit,
  onRemove,
  onChangeWidget,
  onResize,
}) => {
  if (node.type === "leaf") {
    return (
      <div className="relative w-full h-full flex flex-col bg-audiophile-surface border border-audiophile-border overflow-hidden">
        {/* Barra de herramientas superior en Modo Edición */}
        {isEditing && (
          <div className="absolute top-0 left-0 right-0 z-30 bg-audiophile-base/95 border-b border-audiophile-cyan/40 px-2 py-1.5 flex items-center justify-between gap-2 shadow-lg backdrop-blur">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-audiophile-cyan animate-pulse" />
              <select
                value={node.widget}
                onChange={(e) => onChangeWidget(node.id, e.target.value as WidgetType)}
                className="bg-audiophile-surface2 border border-audiophile-border rounded px-2 py-0.5 text-[11px] font-mono text-audiophile-text focus:outline-none focus:border-audiophile-cyan"
              >
                {AVAILABLE_WIDGETS.map((w) => (
                  <option key={w.type} value={w.type}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onSplit(node.id, "horizontal")}
                className="p-1 rounded bg-audiophile-surface2 hover:bg-audiophile-border text-audiophile-text transition-colors"
                title="Dividir en columnas (Horizontal)"
              >
                <Columns size={12} />
              </button>
              <button
                onClick={() => onSplit(node.id, "vertical")}
                className="p-1 rounded bg-audiophile-surface2 hover:bg-audiophile-border text-audiophile-text transition-colors"
                title="Dividir en filas (Vertical)"
              >
                <Rows size={12} />
              </button>
              <button
                onClick={() => onRemove(node.id)}
                className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors"
                title="Eliminar este panel"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Contenido del widget */}
        <div className={`w-full h-full ${isEditing ? "pt-8" : ""}`}>
          <WidgetRenderer widget={node.widget} />
        </div>
      </div>
    );
  }

  // Split Container usando Group y Separator de react-resizable-panels v4
  return (
    <Group
      orientation={node.direction}
      onLayoutChanged={(layoutMap) => {
        // Extraer los tamaños en orden de los hijos
        const newSizes = node.children.map((c) => layoutMap[c.id] ?? 0);
        onResize(node.id, newSizes);
      }}
      className="w-full h-full"
    >
      {node.children.map((child, index) => {
        const defaultSize = node.sizes[index] ?? 100 / node.children.length;

        return (
          <React.Fragment key={child.id}>
            <Panel id={child.id} defaultSize={defaultSize} minSize={10} className="w-full h-full">
              <LayoutNodeRenderer
                node={child}
                isEditing={isEditing}
                onSplit={onSplit}
                onRemove={onRemove}
                onChangeWidget={onChangeWidget}
                onResize={onResize}
              />
            </Panel>

            {index < node.children.length - 1 && (
              <Separator
                disabled={!isEditing}
                className={`relative transition-colors flex items-center justify-center shrink-0 ${
                  node.direction === "horizontal"
                    ? isEditing ? "w-0.5" : "w-px"
                    : isEditing ? "h-0.5" : "h-px"
                } ${isEditing ? `bg-audiophile-cyan/55 ${node.direction === "horizontal" ? "cursor-col-resize" : "cursor-row-resize"}` : "bg-audiophile-border cursor-default"}`}
                title={isEditing ? "Arrastrar para cambiar el tamaño del panel" : undefined}
              >
                {isEditing && (
                  <span className="pointer-events-none absolute flex h-4 w-2 items-center justify-center rounded-sm bg-audiophile-surface2/90 text-audiophile-muted/70 shadow-sm">
                    {node.direction === "horizontal" ? <GripVertical size={8} /> : <GripHorizontal size={8} />}
                  </span>
                )}
              </Separator>
            )}
          </React.Fragment>
        );
      })}
    </Group>
  );
};
