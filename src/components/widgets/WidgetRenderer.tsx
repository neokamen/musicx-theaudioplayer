import React from "react";
import type { WidgetType } from "../../types/layout.ts";
import { FolderExplorer } from "./FolderExplorer.tsx";
import { VirtualTrackList } from "./VirtualTrackList.tsx";
import { InspectorWidget } from "./InspectorWidget.tsx";
import { DacTelemetryWidget } from "./DacTelemetryWidget.tsx";
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
    case "inspector":
      return <InspectorWidget />;
    case "dac_telemetry":
      return <DacTelemetryWidget />;
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
