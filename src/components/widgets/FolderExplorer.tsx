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
    appearance,
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
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      {/* Barra Superior de Herramientas y Navegación Dolphin */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={navigateBack}
              disabled={explorer.historyIndex <= 0}
              className="p-1.5 rounded hover:bg-audiophile-surface text-audiophile-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Atrás"
            >
              <ChevronLeft size={14} />
            </button>

            <button
              onClick={navigateForward}
              disabled={explorer.historyIndex >= explorer.history.length - 1}
              className="p-1.5 rounded hover:bg-audiophile-surface text-audiophile-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Adelante"
            >
              <ChevronRight size={14} />
            </button>

            <button
              onClick={navigateUp}
              disabled={explorer.currentPath === "/"}
              className="p-1.5 rounded hover:bg-audiophile-surface text-audiophile-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Subir un nivel (Directorio Superior)"
            >
              <ArrowUp size={14} />
            </button>

            <button
              onClick={() => browseDirectory(explorer.currentPath)}
              className="p-1.5 rounded hover:bg-audiophile-surface text-audiophile-muted transition-colors"
              title="Recargar carpeta actual"
            >
              <RefreshCw size={12} className={explorer.isLoading ? "animate-spin text-audiophile-cyan" : ""} />
            </button>

            {/* Selector de Modos de Vista Estilo Dolphin */}
            <div className="flex items-center ml-2 border border-audiophile-border rounded overflow-hidden bg-audiophile-base p-0.5">
              <button
                onClick={() => setViewMode("compact")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "compact"
                    ? "bg-cyan-950/60 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Lista Compacta"
              >
                <List size={13} />
              </button>
              <button
                onClick={() => setViewMode("details")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "details"
                    ? "bg-cyan-950/60 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Lista de Detalles"
              >
                <Table size={13} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-cyan-950/60 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-white"
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
                ? "bg-amber-950/60 text-amber-300 border border-amber-600"
                : "bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300"
            }`}
            title="Indexar carpeta recursivamente a la base de datos"
          >
            {scanStatus.is_scanning ? (
              <>
                <RefreshCw size={11} className="animate-spin text-amber-400" />
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
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono overflow-x-auto whitespace-nowrap scrollbar-none">
          <HardDrive size={12} style={{ color: appearance.accentColor }} className="mr-1.5 shrink-0" />

          {isEditingPath ? (
            <form onSubmit={handleCustomPathSubmit} className="flex-1">
              <input
                type="text"
                autoFocus
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                onBlur={() => setIsEditingPath(false)}
                className="w-full bg-transparent text-slate-200 focus:outline-none"
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
                className="hover:text-cyan-400 text-slate-400 font-bold transition-colors"
              >
                /
              </button>
              {pathParts.map((part: string, index: number) => (
                <React.Fragment key={`${part}-${index}`}>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="hover:text-cyan-400 text-slate-300 hover:underline truncate max-w-[120px] transition-colors"
                    title={part}
                  >
                    {part}
                  </button>
                  {index < pathParts.length - 1 && (
                    <span className="text-slate-600">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Filtro rápido local */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded px-2 py-0.5">
          <Search size={11} className="text-slate-500 mr-1.5 shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar en esta carpeta..."
            className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Vista de Archivos y Carpetas (Compacta, Detalles, Cuadrícula) */}
      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {explorer.error ? (
          <div className="p-6 text-center text-red-400 font-sans text-xs">
            {explorer.error}
          </div>
        ) : filteredEntries.length === 0 && explorer.currentPath === "/" ? (
          <div className="p-8 text-center text-slate-500 font-sans text-xs flex flex-col items-center gap-2">
            <Radio size={24} className="text-slate-700" />
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
                {/* Directorio superior siempre en el primer hueco */}
                {explorer.currentPath !== "/" && (
                  <div
                    onDoubleClick={navigateUp}
                    onClick={navigateUp}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-slate-800/70 cursor-pointer text-slate-400 hover:text-cyan-300 font-bold border-b border-slate-800/40 transition-colors"
                  >
                    <Folder size={14} className="text-amber-400 shrink-0" />
                    <span>.. [Directorio Superior]</span>
                  </div>
                )}

                {filteredEntries.map((entry: FileNode) => (
                  <div
                    key={entry.path}
                    onDoubleClick={() => handleEntryClick(entry)}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-slate-800/60 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                      {entry.is_dir ? (
                        <Folder size={14} className="text-amber-400 shrink-0" />
                      ) : (
                        <Music size={14} style={{ color: appearance.accentColor }} className="shrink-0" />
                      )}
                      <span
                        className="truncate text-slate-300 group-hover:text-white transition-all group-hover:animate-marquee"
                        title={entry.name}
                      >
                        {entry.name}
                      </span>
                    </div>

                    {!entry.is_dir && (
                      <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[10px]">
                        {entry.extension && (
                          <span
                            className="uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-[9px] font-semibold"
                            style={{ color: appearance.accentColor }}
                          >
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
                            className="p-1 hover:text-cyan-300"
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
                            className="p-1 hover:text-cyan-300"
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
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="p-2">Nombre</th>
                    <th className="p-2 w-24">Tipo</th>
                    <th className="p-2 w-28 text-right">Tamaño</th>
                    <th className="p-2 w-16 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {explorer.currentPath !== "/" && (
                    <tr
                      onClick={navigateUp}
                      className="border-b border-slate-800/40 hover:bg-slate-800/60 cursor-pointer text-slate-400 hover:text-cyan-300 font-bold transition-colors"
                    >
                      <td className="p-2 flex items-center gap-2">
                        <Folder size={14} className="text-amber-400 shrink-0" />
                        <span>.. [Directorio Superior]</span>
                      </td>
                      <td className="p-2 text-[10px]">Carpeta</td>
                      <td className="p-2 text-right text-[10px]">---</td>
                      <td className="p-2"></td>
                    </tr>
                  )}

                  {filteredEntries.map((entry: FileNode) => (
                    <tr
                      key={entry.path}
                      onDoubleClick={() => handleEntryClick(entry)}
                      className="border-b border-slate-800/40 hover:bg-slate-800/60 cursor-pointer group transition-colors"
                    >
                      <td className="p-2 flex items-center gap-2 truncate">
                        {entry.is_dir ? (
                          <Folder size={14} className="text-amber-400 shrink-0" />
                        ) : (
                          <Music size={14} style={{ color: appearance.accentColor }} className="shrink-0" />
                        )}
                        <span className="truncate text-slate-300 group-hover:text-white" title={entry.name}>
                          {entry.name}
                        </span>
                      </td>
                      <td className="p-2 text-slate-400 text-[10px] uppercase">
                        {entry.is_dir ? "Carpeta" : entry.extension || "Audio"}
                      </td>
                      <td className="p-2 text-right text-slate-400 text-[10px]">
                        {entry.is_dir ? "---" : `${(entry.size / (1024 * 1024)).toFixed(2)} MB`}
                      </td>
                      <td className="p-2 text-center">
                        {!entry.is_dir && (
                          <button
                            onClick={() => handleEntryClick(entry)}
                            className="p-1 hover:text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
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

            {/* 3. MODO CUADRÍCULA DE ÍCONOS */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2">
                {explorer.currentPath !== "/" && (
                  <div
                    onClick={navigateUp}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-400 cursor-pointer flex flex-col items-center justify-center gap-2 text-center group transition"
                  >
                    <Folder size={28} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-300 truncate w-full">
                      .. [Subir]
                    </span>
                  </div>
                )}

                {filteredEntries.map((entry: FileNode) => (
                  <div
                    key={entry.path}
                    onDoubleClick={() => handleEntryClick(entry)}
                    className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer flex flex-col items-center justify-center gap-2 text-center group transition"
                    title={entry.name}
                  >
                    {entry.is_dir ? (
                      <Folder size={28} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Music size={28} style={{ color: appearance.accentColor }} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] text-slate-300 group-hover:text-white truncate w-full">
                      {entry.name}
                    </span>
                    {!entry.is_dir && (
                      <span className="text-[9px] text-slate-500 uppercase font-mono">
                        {entry.extension || "audio"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
