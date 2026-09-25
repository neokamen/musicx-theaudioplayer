import React, { useState } from "react";
import { useMusicStore } from "../../store/index.ts";
import {
  Folder,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  RefreshCw,
  Music,
  HardDrive,
  Search,
} from "lucide-react";
import type { FileNode } from "../../types/index.ts";

export const FolderExplorerWidget: React.FC = () => {
  const {
    explorer,
    browseDirectory,
    navigateBack,
    navigateForward,
    navigateUp,
    play,
    addToQueue,
    startDirectoryScan,
    scanStatus,
  } = useMusicStore();

  const [inputPath, setInputPath] = useState(explorer.currentPath);
  const [filterQuery, setFilterQuery] = useState("");

  const handleNavigate = (path: string) => {
    setInputPath(path);
    browseDirectory(path);
  };

  const handleEntryClick = (entry: FileNode) => {
    if (entry.is_dir) {
      handleNavigate(entry.path);
    } else {
      // Pista de audio individual: reproducir directamente
      play({
        filepath: entry.path,
        title: entry.name.replace(/\.[^/.]+$/, ""),
        artist: "Desconocido",
        album: "Directorio Local",
        track_number: null,
        duration_seconds: 0,
        format: entry.extension ? entry.extension.toUpperCase() : "AUDIO",
        sample_rate: 0,
        bit_depth: 0,
        bitrate_kbps: 0,
        file_size: entry.size,
        mtime: 0,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      browseDirectory(inputPath);
    }
  };

  const filteredEntries = explorer.entries.filter((entry: FileNode) =>
    entry.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans text-xs">
      {/* Barra de navegación superior estilo Dolphin */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={navigateBack}
            disabled={explorer.historyIndex <= 0}
            className="p-1 rounded hover:bg-audiophile-border disabled:opacity-30 text-audiophile-text transition-colors"
            title="Atrás"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={navigateForward}
            disabled={explorer.historyIndex >= explorer.history.length - 1}
            className="p-1 rounded hover:bg-audiophile-border disabled:opacity-30 text-audiophile-text transition-colors"
            title="Adelante"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={navigateUp}
            className="p-1 rounded hover:bg-audiophile-border text-audiophile-text transition-colors"
            title="Subir de directorio"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={() => browseDirectory(explorer.currentPath)}
            className="p-1 rounded hover:bg-audiophile-border text-audiophile-text transition-colors"
            title="Refrescar carpeta"
          >
            <RefreshCw size={13} className={explorer.isLoading ? "animate-spin" : ""} />
          </button>

          {/* Input de ruta directa */}
          <div className="flex-1 flex items-center bg-audiophile-base border border-audiophile-border rounded px-2 py-0.5 ml-1">
            <HardDrive size={12} className="text-audiophile-cyan mr-1.5 shrink-0" />
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="/home/usuario/Música"
              className="w-full bg-transparent font-mono text-[11px] text-audiophile-text focus:outline-none"
            />
          </div>

          <button
            onClick={() => startDirectoryScan(explorer.currentPath)}
            disabled={scanStatus.is_scanning}
            className="px-2 py-1 bg-audiophile-border hover:bg-audiophile-cyan/20 hover:text-audiophile-cyan rounded text-[10px] font-mono shrink-0 transition-colors"
            title="Escanear recursivamente esta carpeta para añadirla a la biblioteca"
          >
            {scanStatus.is_scanning ? "Escaneando..." : "Indexar"}
          </button>
        </div>

        {/* Búsqueda rápida en el directorio actual */}
        <div className="flex items-center bg-audiophile-base border border-audiophile-border/70 rounded px-2 py-0.5">
          <Search size={11} className="text-audiophile-muted mr-1.5 shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar archivos en esta carpeta..."
            className="w-full bg-transparent text-[11px] text-audiophile-text placeholder-audiophile-muted/60 focus:outline-none"
          />
        </div>
      </div>

      {/* Lista de archivos / carpetas */}
      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {explorer.error ? (
          <div className="p-4 text-center text-red-400 font-sans text-xs">
            {explorer.error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-4 text-center text-audiophile-muted font-sans text-xs">
            {explorer.isLoading ? "Cargando directorio..." : "Carpeta vacía o sin archivos de audio compatibles"}
          </div>
        ) : (
          filteredEntries.map((entry: FileNode) => (
            <div
              key={entry.path}
              onDoubleClick={() => handleEntryClick(entry)}
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-audiophile-surface2 cursor-pointer group transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {entry.is_dir ? (
                  <Folder size={13} className="text-audiophile-amber shrink-0" />
                ) : (
                  <Music size={13} className="text-audiophile-cyan shrink-0" />
                )}
                <span className="truncate text-audiophile-text group-hover:text-white">
                  {entry.name}
                </span>
              </div>

              {!entry.is_dir && (
                <div className="flex items-center gap-2 shrink-0 text-audiophile-muted text-[10px]">
                  {entry.extension && (
                    <span className="uppercase px-1 rounded bg-audiophile-border/60 text-[9px]">
                      {entry.extension}
                    </span>
                  )}
                  <span>{(entry.size / (1024 * 1024)).toFixed(1)} MB</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue({
                        filepath: entry.path,
                        title: entry.name.replace(/\.[^/.]+$/, ""),
                        artist: "Desconocido",
                        album: "Directorio Local",
                        track_number: null,
                        duration_seconds: 0,
                        format: entry.extension ? entry.extension.toUpperCase() : "AUDIO",
                        sample_rate: 0,
                        bit_depth: 0,
                        bitrate_kbps: 0,
                        file_size: entry.size,
                        mtime: 0,
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-audiophile-cyan px-1 text-[11px]"
                    title="Añadir a la cola"
                  >
                    + Cola
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer de estado del explorador */}
      <div className="h-6 px-3 border-t border-audiophile-border bg-audiophile-surface2 flex items-center justify-between text-[10px] font-mono text-audiophile-muted">
        <span>{filteredEntries.length} elementos</span>
        <span className="text-audiophile-cyan truncate max-w-[200px]">{explorer.currentPath}</span>
      </div>
    </div>
  );
};
