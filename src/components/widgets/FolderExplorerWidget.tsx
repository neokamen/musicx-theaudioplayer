import React, { useState, useMemo } from "react";
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
  ArrowUpDown,
  ArrowUp as SortUp,
  ArrowDown as SortDown,
  Plus,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import type { FileNode } from "../../types/index.ts";

type FolderSortField = "name" | "extension" | "size";
type FolderSortDir = "asc" | "desc";

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
    appearance,
  } = useMusicStore();

  const [inputPath, setInputPath] = useState(explorer.currentPath);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortField, setSortField] = useState<FolderSortField>("name");
  const [sortDir, setSortDir] = useState<FolderSortDir>("asc");
  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    size: true,
    action: true,
  });
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setInputPath(path);
    browseDirectory(path);
  };

  const handleEntryClick = (entry: FileNode) => {
    if (entry.is_dir) {
      handleNavigate(entry.path);
    } else {
      play({
        filepath: entry.path,
        title: entry.name.replace(/\.[^/.]+$/, ""),
        artist: "Explorador de Archivos",
        album: "Carpeta Local",
        track_number: null,
        duration_seconds: 0,
        format: entry.extension ? entry.extension.toUpperCase() : "AUDIO",
        sample_rate: 44100,
        bit_depth: 16,
        bitrate_kbps: 1411,
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

  const handleSort = (field: FolderSortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedAndFilteredEntries = useMemo(() => {
    return explorer.entries
      .filter((entry: FileNode) =>
        entry.name.toLowerCase().includes(filterQuery.toLowerCase())
      )
      .sort((a, b) => {
        // Folders always first
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;

        let comp = 0;
        if (sortField === "name") {
          comp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        } else if (sortField === "extension") {
          const extA = a.extension || "";
          const extB = b.extension || "";
          comp = extA.localeCompare(extB);
        } else if (sortField === "size") {
          comp = a.size - b.size;
        }
        return sortDir === "asc" ? comp : -comp;
      });
  }, [explorer.entries, filterQuery, sortField, sortDir]);

  const renderSortIcon = (field: FolderSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-50" />;
    }
    return sortDir === "asc" ? (
      <SortUp size={11} style={{ color: appearance.accentColor }} />
    ) : (
      <SortDown size={11} style={{ color: appearance.accentColor }} />
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans text-xs overflow-hidden">
      {/* Barra de navegación superior estilo Dolphin */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex flex-col gap-1.5 shrink-0">
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

        {/* Búsqueda rápida y personalización de columnas */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-audiophile-base border border-audiophile-border/70 rounded px-2 py-0.5">
            <Search size={11} className="text-audiophile-muted mr-1.5 shrink-0" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrar archivos en esta carpeta..."
              className="w-full bg-transparent text-[11px] text-audiophile-text placeholder-audiophile-muted/60 focus:outline-none"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
              className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Personalizar columnas visibles"
            >
              <SlidersHorizontal size={12} />
            </button>

            {isColMenuOpen && (
              <div className="absolute top-7 right-0 w-44 p-2 bg-slate-950 border border-slate-700 shadow-2xl rounded-lg z-50 font-mono text-[10px] space-y-1.5">
                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">Columnas Visibles</div>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Tipo / Códec</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns.type}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, type: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Tamaño</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns.size}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, size: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Acción (+ Cola)</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns.action}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, action: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Encabezado fijo de columnas ordenables */}
      <div className="h-7 bg-audiophile-base border-b border-audiophile-border text-[10px] font-mono text-audiophile-muted uppercase tracking-wider flex items-center px-2 shrink-0">
        <div
          onClick={() => handleSort("name")}
          className="flex-1 cursor-pointer flex items-center gap-1 group hover:text-white truncate"
        >
          <span>Nombre</span>
          {renderSortIcon("name")}
        </div>

        {visibleColumns.type && (
          <div
            onClick={() => handleSort("extension")}
            className="w-16 text-center cursor-pointer flex items-center justify-center gap-1 group hover:text-white shrink-0"
          >
            <span>Tipo</span>
            {renderSortIcon("extension")}
          </div>
        )}

        {visibleColumns.size && (
          <div
            onClick={() => handleSort("size")}
            className="w-20 text-right cursor-pointer flex items-center justify-end gap-1 group hover:text-white shrink-0 pr-2"
          >
            <span>Tamaño</span>
            {renderSortIcon("size")}
          </div>
        )}

        {visibleColumns.action && (
          <div className="w-16 text-center shrink-0">
            <span>Acción</span>
          </div>
        )}
      </div>

      {/* Lista de archivos / carpetas */}
      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {explorer.error ? (
          <div className="p-4 text-center text-red-400 font-sans text-xs">
            {explorer.error}
          </div>
        ) : sortedAndFilteredEntries.length === 0 ? (
          <div className="p-4 text-center text-audiophile-muted font-sans text-xs">
            {explorer.isLoading ? "Cargando directorio..." : "Carpeta vacía o sin archivos de audio compatibles"}
          </div>
        ) : (
          sortedAndFilteredEntries.map((entry: FileNode) => (
            <div
              key={entry.path}
              onDoubleClick={() => handleEntryClick(entry)}
              className="flex items-center justify-between px-2 py-1 rounded hover:bg-audiophile-surface2 cursor-pointer group transition-colors border-b border-audiophile-border/20"
            >
              {/* Nombre y tipo */}
              <div className="flex-1 flex items-center gap-2 overflow-hidden pr-2">
                {entry.is_dir ? (
                  <Folder size={13} className="text-audiophile-amber shrink-0" />
                ) : (
                  <Music size={13} className="text-audiophile-cyan shrink-0" />
                )}
                <span className="truncate text-audiophile-text group-hover:text-white" title={entry.name}>
                  {entry.name}
                </span>
              </div>

              {/* Columna Tipo */}
              {visibleColumns.type && (
                <div className="w-16 text-center shrink-0 text-audiophile-muted text-[10px]">
                  {entry.is_dir ? (
                    <span className="text-[9px] text-slate-500">DIR</span>
                  ) : entry.extension ? (
                    <span className="uppercase px-1 rounded bg-audiophile-border/60 text-[9px] font-bold text-slate-300">
                      {entry.extension}
                    </span>
                  ) : (
                    <span>---</span>
                  )}
                </div>
              )}

              {/* Columna Tamaño */}
              {visibleColumns.size && (
                <div className="w-20 text-right shrink-0 text-audiophile-muted text-[10px] pr-2">
                  {entry.is_dir ? "---" : `${(entry.size / (1024 * 1024)).toFixed(1)} MB`}
                </div>
              )}

              {/* Columna Acción: Reproducir o Añadir a Cola */}
              {visibleColumns.action && (
                <div className="w-16 flex items-center justify-center gap-1 shrink-0">
                  {!entry.is_dir && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEntryClick(entry);
                        }}
                        className="p-1 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition"
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
                            artist: "Explorador Local",
                            album: "Cola",
                            track_number: null,
                            duration_seconds: 0,
                            format: entry.extension ? entry.extension.toUpperCase() : "AUDIO",
                            sample_rate: 44100,
                            bit_depth: 16,
                            bitrate_kbps: 1411,
                            file_size: entry.size,
                            mtime: 0,
                          });
                        }}
                        className="p-1 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition"
                        title="Añadir a cola de reproducción"
                      >
                        <Plus size={12} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer de estado del explorador */}
      <div className="h-6 px-3 border-t border-audiophile-border bg-audiophile-surface2 flex items-center justify-between text-[10px] font-mono text-audiophile-muted">
        <span>{sortedAndFilteredEntries.length} elementos</span>
        <span className="text-audiophile-cyan truncate max-w-[200px]">{explorer.currentPath}</span>
      </div>
    </div>
  );
};
