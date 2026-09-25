import React from "react";
import type { WidgetType } from "../../types/layout.ts";
import { FolderExplorer } from "./FolderExplorer.tsx";
import { VirtualTrackList } from "./VirtualTrackList.tsx";
import { CoverWidget } from "./CoverWidget.tsx";
import { InspectorWidget } from "./InspectorWidget.tsx";
import { DacTelemetryWidget } from "./DacTelemetryWidget.tsx";
import { EqBarsWidget } from "./EqBarsWidget.tsx";
import { QueueWidget } from "./QueueWidget.tsx";

interface WidgetRendererProps {
  widget: WidgetType;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  switch (widget) {
    case "folder_explorer":
      return <FolderExplorer />;
    case "tracklist":
      return <VirtualTrackList />;
    case "cover":
      return <CoverWidget />;
    case "inspector":
      return <InspectorWidget />;
    case "dac_telemetry":
      return <DacTelemetryWidget />;
    case "eq_bars":
      return <EqBarsWidget />;
    case "queue":
      return <QueueWidget />;
    default:
      return (
        <div className="p-4 text-center text-audiophile-muted font-mono text-xs">
          Widget desconocido: {widget}
        </div>
      );
  }
};
