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
  Plus,
  Play,
  Database,
  Radio,
  List,
  Table,
  LayoutGrid,
} from "lucide-react";
import type { FileNode } from "../../types/index.ts";

export type ExplorerViewMode = 'compact' | 'details' | 'grid';

export const FolderExplorer: React.FC = () => {
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

  const [filterQuery, setFilterQuery] = useState("");
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [customPath, setCustomPath] = useState(explorer.currentPath);
  const [viewMode, setViewMode] = useState<ExplorerViewMode>("compact");

  const pathParts = explorer.currentPath.split("/").filter(Boolean);

  const handleBreadcrumbClick = (index: number) => {
    const target = "/" + pathParts.slice(0, index + 1).join("/");
    browseDirectory(target);
  };

  const handleCustomPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingPath(false);
    if (customPath.trim()) {
      browseDirectory(customPath.trim());
    }
  };

  const handleEntryClick = (entry: FileNode) => {
    if (entry.is_dir) {
      browseDirectory(entry.path);
    } else {
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

  const filteredEntries = explorer.entries.filter((entry: FileNode) =>
    entry.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans text-xs overflow-hidden">
      {/* Barra de navegación superior estilo Dolphin con Breadcrumbs & Selector de Vista */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-1.5">
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
              title="Recargar directorio"
            >
              <RefreshCw size={12} className={explorer.isLoading ? "animate-spin" : ""} />
            </button>

            {/* Separador */}
            <div className="w-[1px] h-4 bg-audiophile-border mx-1" />

            {/* Selector de modo de vista estilo Dolphin (Compacto, Detalles, Iconos) */}
            <div className="flex items-center bg-audiophile-base border border-audiophile-border rounded p-0.5 gap-0.5">
              <button
                onClick={() => setViewMode("compact")}
                className={`p-1 rounded transition-all ${
                  viewMode === "compact"
                    ? "bg-audiophile-cyan/20 text-audiophile-cyan font-bold"
                    : "text-audiophile-muted hover:text-white"
                }`}
                title="Lista Compacta"
              >
                <List size={13} />
              </button>
              <button
                onClick={() => setViewMode("details")}
                className={`p-1 rounded transition-all ${
                  viewMode === "details"
                    ? "bg-audiophile-cyan/20 text-audiophile-cyan font-bold"
                    : "text-audiophile-muted hover:text-white"
                }`}
                title="Lista Detalles"
              >
                <Table size={13} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded transition-all ${
                  viewMode === "grid"
                    ? "bg-audiophile-cyan/20 text-audiophile-cyan font-bold"
                    : "text-audiophile-muted hover:text-white"
                }`}
                title="Cuadrícula de Íconos"
              >
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>

          {/* Botón de Sincronización e Indexación en SQLite */}
          <button
            onClick={() => startDirectoryScan(explorer.currentPath)}
            disabled={scanStatus.is_scanning}
            className={`px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
              scanStatus.is_scanning
                ? "bg-audiophile-amber/20 text-audiophile-amber border border-audiophile-amber/40"
                : "bg-audiophile-surface border border-audiophile-border hover:border-audiophile-cyan text-audiophile-cyan"
            }`}
            title="Indexar carpeta recursivamente a la base de datos"
          >
            {scanStatus.is_scanning ? (
              <>
                <RefreshCw size={11} className="animate-spin text-audiophile-amber" />
                <span>
                  Sincronizando ({scanStatus.current}/{scanStatus.total})
                </span>
              </>
            ) : (
              <>
                <Database size={11} />
                <span>Sincronizar Biblioteca</span>
              </>
            )}
          </button>
        </div>

        {/* Breadcrumbs interactivos y clicables */}
        <div className="flex items-center bg-audiophile-base border border-audiophile-border rounded px-2 py-1 text-[11px] font-mono overflow-x-auto whitespace-nowrap scrollbar-none">
          <HardDrive size={12} className="text-audiophile-cyan mr-1.5 shrink-0" />
          
          {isEditingPath ? (
            <form onSubmit={handleCustomPathSubmit} className="flex-1">
              <input
                type="text"
                autoFocus
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                onBlur={() => setIsEditingPath(false)}
                className="w-full bg-transparent text-audiophile-text focus:outline-none"
              />
            </form>
          ) : (
            <div
              className="flex items-center gap-1 flex-1 cursor-text"
              onDoubleClick={() => {
                setCustomPath(explorer.currentPath);
                setIsEditingPath(true);
              }}
            >
              <button
                onClick={() => browseDirectory("/")}
                className="hover:text-audiophile-cyan text-audiophile-muted font-bold transition-colors"
              >
                /
              </button>
              {pathParts.map((part: string, index: number) => (
                <React.Fragment key={`${part}-${index}`}>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="hover:text-audiophile-cyan text-audiophile-text hover:underline truncate max-w-[120px] transition-colors"
                    title={part}
                  >
                    {part}
                  </button>
                  {index < pathParts.length - 1 && (
                    <span className="text-audiophile-muted/60">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Filtro rápido local */}
        <div className="flex items-center bg-audiophile-base/70 border border-audiophile-border/70 rounded px-2 py-0.5">
          <Search size={11} className="text-audiophile-muted mr-1.5 shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar en esta carpeta..."
            className="w-full bg-transparent text-[11px] text-audiophile-text placeholder-audiophile-muted/50 focus:outline-none"
          />
        </div>
      </div>

      {/* Vista de Archivos y Carpetas (Compacta, Detalles, Cuadrícula) */}
      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {explorer.error ? (
          <div className="p-6 text-center text-red-400 font-sans text-xs">
            {explorer.error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-audiophile-muted font-sans text-xs flex flex-col items-center gap-2">
            <Radio size={24} className="text-audiophile-muted/30" />
            <span>
              {explorer.isLoading
                ? "Cargando directorio..."
                : "No se encontraron carpetas ni pistas de audio compatibles"}
            </span>
          </div>
        ) : (
          <>
            {/* 1. MODO COMPACTO */}
            {viewMode === "compact" && (
              <div className="flex flex-col gap-0.5">
                {filteredEntries.map((entry: FileNode) => (
                  <div
                    key={entry.path}
                    onDoubleClick={() => handleEntryClick(entry)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-audiophile-surface2 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {entry.is_dir ? (
                        <Folder size={14} className="text-audiophile-amber shrink-0" />
                      ) : (
                        <Music size={14} className="text-audiophile-cyan shrink-0" />
                      )}
                      <span className="truncate text-audiophile-text group-hover:text-white">
                        {entry.name}
                      </span>
                    </div>

                    {!entry.is_dir && (
                      <div className="flex items-center gap-2 shrink-0 text-audiophile-muted text-[10px]">
                        {entry.extension && (
                          <span className="uppercase px-1.5 py-0.2 rounded bg-audiophile-border/70 text-[9px] font-semibold text-audiophile-cyan">
                            {entry.extension}
                          </span>
                        )}
                        <span>{(entry.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEntryClick(entry);
                            }}
                            className="p-1 hover:text-audiophile-cyan"
                            title="Reproducir ahora"
                          >
                            <Play size={11} fill="currentColor" />
                          </button>
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
                            className="p-1 hover:text-audiophile-cyan"
                            title="Añadir a la cola"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 2. MODO DETALLES */}
            {viewMode === "details" && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-audiophile-border text-[10px] text-audiophile-muted uppercase font-sans">
                    <th className="p-2">Nombre</th>
                    <th className="p-2 w-24">Tipo</th>
                    <th className="p-2 w-28 text-right">Tamaño</th>
                    <th className="p-2 w-16 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry: FileNode) => (
                    <tr
                      key={entry.path}
                      onDoubleClick={() => handleEntryClick(entry)}
                      className="border-b border-audiophile-border/30 hover:bg-audiophile-surface2 cursor-pointer group transition-colors"
                    >
                      <td className="p-2 flex items-center gap-2 truncate">
                        {entry.is_dir ? (
                          <Folder size={14} className="text-audiophile-amber shrink-0" />
                        ) : (
                          <Music size={14} className="text-audiophile-cyan shrink-0" />
                        )}
                        <span className="truncate text-audiophile-text group-hover:text-white">
                          {entry.name}
                        </span>
                      </td>
                      <td className="p-2 text-audiophile-muted text-[10px] uppercase">
                        {entry.is_dir ? "Carpeta" : entry.extension || "Audio"}
                      </td>
                      <td className="p-2 text-right text-audiophile-muted text-[10px]">
                        {entry.is_dir ? "---" : `${(entry.size / (1024 * 1024)).toFixed(2)} MB`}
                      </td>
                      <td className="p-2 text-center">
                        {!entry.is_dir && (
                          <button
                            onClick={() => handleEntryClick(entry)}
                            className="p-1 hover:text-audiophile-cyan opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Reproducir"
                          >
                            <Play size={11} fill="currentColor" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. MODO CUADRÍCULA / ICONOS */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2">
                {filteredEntries.map((entry: FileNode) => (
                  <div
                    key={entry.path}
                    onDoubleClick={() => handleEntryClick(entry)}
                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-audiophile-surface2/60 border border-audiophile-border/50 hover:border-audiophile-cyan hover:bg-audiophile-surface2 cursor-pointer group transition-all text-center"
                  >
                    {entry.is_dir ? (
                      <Folder size={36} className="text-audiophile-amber mb-2 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Music size={36} className="text-audiophile-cyan mb-2 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] text-audiophile-text group-hover:text-white line-clamp-2 break-all">
                      {entry.name}
                    </span>
                    {!entry.is_dir && (
                      <span className="text-[9px] text-audiophile-muted mt-1 font-mono">
                        {(entry.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pie de estado del explorador */}
      <div className="h-6 px-3 border-t border-audiophile-border bg-audiophile-surface2 flex items-center justify-between text-[10px] font-mono text-audiophile-muted shrink-0">
        <span>{filteredEntries.length} elementos ({viewMode.toUpperCase()})</span>
        <span className="text-audiophile-cyan truncate max-w-[220px]">
          {explorer.currentPath}
        </span>
      </div>
    </div>
  );
};
