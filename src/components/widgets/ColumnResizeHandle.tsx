import React, { useRef } from "react";

interface ColumnResizeHandleProps {
  onResize: (deltaPixels: number) => void;
}

export const ColumnResizeHandle: React.FC<ColumnResizeHandleProps> = ({ onResize }) => {
  const lastX = useRef<number | null>(null);

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        lastX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (lastX.current === null) return;
        const delta = event.clientX - lastX.current;
        lastX.current = event.clientX;
        onResize(delta);
      }}
      onPointerUp={() => { lastX.current = null; }}
      onPointerCancel={() => { lastX.current = null; }}
      onClick={(event) => event.stopPropagation()}
      className="column-resize-handle absolute right-0 top-1 bottom-1 z-10 w-1 cursor-col-resize touch-none"
      title="Arrastrar para cambiar el ancho de las columnas"
    />
  );
};