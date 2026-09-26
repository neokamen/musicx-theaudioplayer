import React, { useState, useMemo, useRef } from "react";
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
  FolderPlus,
} from "lucide-react";
import type { FileNode, Track } from "../../types/index.ts";
import { ColumnResizeHandle } from "./ColumnResizeHandle.tsx";

type ExplorerColumn = "name" | "type" | "size" | "duration" | "bitrate" | "action";
type ExplorerColumnWidths = Record<ExplorerColumn, number>;

type FolderSortField = "name" | "extension" | "size" | "duration" | "bitrate";
type FolderSortDir = "asc" | "desc";

interface TrackRowProps {
  entry: FileNode;
  visibleColumns: {
    type: boolean;
    size: boolean;
    duration: boolean;
    bitrate: boolean;
    action: boolean;
  };
  columnWidths: ExplorerColumnWidths;
  durationSeconds: number | null;
  onPlay: (entry: FileNode) => void;
  onAddToQueue: (entry: FileNode) => void;
  onAddFolderToQueue: (entry: FileNode) => void;
  onNavigate: (path: string) => void;
}

const ExplorerRow: React.FC<TrackRowProps> = ({
  entry,
  visibleColumns,
  columnWidths,
  durationSeconds,
  onPlay,
  onAddToQueue,
  onAddFolderToQueue,
  onNavigate,
}) => {
  const [isHoveredLong, setIsHoveredLong] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsHoveredLong(true);
    }, 1500);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHoveredLong(false);
  };

  return (
    <div
      onDoubleClick={() => (entry.is_dir ? onNavigate(entry.path) : onPlay(entry))}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex items-center justify-between px-2 py-1 rounded hover:bg-audiophile-surface2 cursor-pointer group transition-colors border-b border-audiophile-border/20 text-[11px]"
    >
      <div className="relative flex items-center gap-2 overflow-hidden pr-2 min-w-0" style={{ flex: `0 0 ${columnWidths.name}%` }}>
        {entry.is_dir ? (
          <Folder size={13} className="text-amber-400 shrink-0" />
        ) : (
          <Music size={13} className="text-cyan-400 shrink-0" />
        )}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <span
            className={`text-audiophile-text group-hover:text-white ${
              isHoveredLong ? "inline-block animate-marquee" : "truncate block"
            }`}
            title={entry.name}
          >
            {entry.name}
          </span>
        </div>
      </div>

      {visibleColumns.type && (
        <div className="relative text-center shrink-0 text-audiophile-muted text-[10px]" style={{ flex: `0 0 ${columnWidths.type}%` }}>
          {entry.is_dir ? (
            <span className="text-[9px] text-slate-500">DIR</span>
          ) : entry.extension ? (
            <span className="uppercase px-1 rounded bg-slate-800 text-[9px] font-bold text-slate-300">
              {entry.extension}
            </span>
          ) : (
            <span>---</span>
          )}
        </div>
      )}

      {visibleColumns.size && (
        <div className="relative text-right shrink-0 text-audiophile-muted text-[10px] pr-2" style={{ flex: `0 0 ${columnWidths.size}%` }}>
          {entry.is_dir ? "---" : `${(entry.size / (1024 * 1024)).toFixed(1)}M`}
        </div>
      )}

      {visibleColumns.duration && (
        <div className="relative text-right shrink-0 text-audiophile-muted text-[10px] pr-2" style={{ flex: `0 0 ${columnWidths.duration}%` }}>
          {entry.is_dir ? "---" : durationSeconds === null ? "--:--" : `${Math.floor(durationSeconds / 60)}:${String(Math.floor(durationSeconds % 60)).padStart(2, "0")}`}
        </div>
      )}

      {visibleColumns.bitrate && (
        <div className="relative text-right shrink-0 text-audiophile-muted text-[10px] pr-2 font-mono" style={{ flex: `0 0 ${columnWidths.bitrate}%` }}>
          {entry.is_dir ? "---" : "1411k"}
        </div>
      )}

      {visibleColumns.action && (
        <div className="relative flex items-center justify-end gap-1.5 shrink-0" style={{ flex: `0 0 ${columnWidths.action}%` }}>
          {entry.is_dir ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFolderToQueue(entry);
              }}
              className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] text-amber-300 opacity-0 group-hover:opacity-100 transition flex items-center gap-1 cursor-pointer"
              title="Añadir carpeta a la cola"
            >
              <FolderPlus size={11} />
              <span>+Cola</span>
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(entry);
                }}
                className="p-1 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Reproducir pista"
              >
                <Play size={11} fill="currentColor" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToQueue(entry);
                }}
                className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-emerald-900/40 text-[10px] text-emerald-300 opacity-0 group-hover:opacity-100 transition flex items-center gap-0.5 cursor-pointer"
                title="Añadir a la cola"
              >
                <Plus size={11} />
                <span>Cola</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

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
    librarySettings,
    fetchLibraryTracks,
    libraryTracks,
    appearance,
  } = useMusicStore();

  const [inputPath, setInputPath] = useState(explorer.currentPath);
  const [folderQuery, setFolderQuery] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [sortField, setSortField] = useState<FolderSortField>("name");
  const [sortDir, setSortDir] = useState<FolderSortDir>("asc");
  const tableRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<ExplorerColumnWidths>({
    name: 38, type: 9, size: 12, duration: 10, bitrate: 12, action: 19,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    size: true,
    duration: true,
    bitrate: true,
    action: true,
  });
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setInputPath(path);
    browseDirectory(path);
  };

  const handleEntryPlay = (entry: FileNode) => {
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
  };

  const handleEntryAddToQueue = (entry: FileNode) => {
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
  };

  const handleAddFolderToQueue = (entry: FileNode) => {
    const audioNodes = explorer.entries.filter(
      (e) => !e.is_dir && /\.(mp3|flac|wav|ogg|m4a|aac|opus|alac)$/i.test(e.name)
    );
    if (audioNodes.length > 0) {
      const tracks: Track[] = audioNodes.map((e, idx) => ({
        filepath: e.path,
        title: e.name.replace(/\.[^/.]+$/, ""),
        artist: entry.name,
        album: entry.name,
        track_number: idx + 1,
        duration_seconds: 0,
        format: e.extension ? e.extension.toUpperCase() : "AUDIO",
        sample_rate: 44100,
        bit_depth: 16,
        bitrate_kbps: 1411,
        file_size: e.size,
        mtime: 0,
      }));
      addToQueue(tracks);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      browseDirectory(inputPath);
    }
  };

  const handleColumnClick = (field: FolderSortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleColumnDoubleClick = (field: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resizeColumns = (left: ExplorerColumn, right: ExplorerColumn, deltaPixels: number) => {
    const totalWidth = tableRef.current?.clientWidth || 1;
    const delta = (deltaPixels / totalWidth) * 100;
    setColumnWidths((widths) => {
      const adjusted = Math.max(5, Math.min(75, widths[left] + delta));
      const appliedDelta = adjusted - widths[left];
      return { ...widths, [left]: adjusted, [right]: Math.max(5, widths[right] - appliedDelta) };
    });
  };

  const sortedAndFilteredEntries = useMemo(() => {
    return explorer.entries
      .filter((entry: FileNode) =>
        entry.name.toLowerCase().includes(folderQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;

        let comp = 0;
        if (sortField === "name") {
          comp = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        } else if (sortField === "extension") {
          comp = (a.extension || "").localeCompare(b.extension || "");
        } else if (sortField === "size") {
          comp = a.size - b.size;
        }

        return sortDir === "asc" ? comp : -comp;
      });
  }, [explorer.entries, folderQuery, sortField, sortDir]);

  const tracksByPath = useMemo(() => new Map(libraryTracks.map((track) => [track.filepath, track])), [libraryTracks]);
  const visibleKnownSeconds = sortedAndFilteredEntries.reduce((sum, entry) => {
    if (entry.is_dir) return sum;
    return sum + (tracksByPath.get(entry.path)?.duration_seconds || 0);
  }, 0);
  const visibleUnindexedCount = sortedAndFilteredEntries.filter((entry) => !entry.is_dir && !tracksByPath.has(entry.path)).length;

  const renderSortIcon = (field: FolderSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-40" />;
    }
    return sortDir === "asc" ? (
      <SortUp size={10} style={{ color: appearance.accentColor }} />
    ) : (
      <SortDown size={10} style={{ color: appearance.accentColor }} />
    );
  };

  return (
    <div ref={tableRef} className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={navigateBack}
            disabled={explorer.historyIndex <= 0}
            className="p-1 rounded hover:bg-audiophile-border text-audiophile-text disabled:opacity-30 transition-colors cursor-pointer"
            title="Atrás"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={navigateForward}
            disabled={explorer.historyIndex >= explorer.history.length - 1}
            className="p-1 rounded hover:bg-audiophile-border text-audiophile-text disabled:opacity-30 transition-colors cursor-pointer"
            title="Adelante"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={navigateUp}
            className="p-1 rounded hover:bg-audiophile-border text-audiophile-text transition-colors cursor-pointer"
            title="Subir de nivel"
          >
            <ArrowUp size={14} />
          </button>
          <button
            onClick={() => browseDirectory(explorer.currentPath)}
            className="p-1 rounded hover:bg-audiophile-border text-audiophile-text transition-colors cursor-pointer"
            title="Refrescar carpeta"
          >
            <RefreshCw size={13} className={explorer.isLoading ? "animate-spin" : ""} />
          </button>

          <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5 ml-1">
            <HardDrive size={12} className="text-cyan-400 mr-1.5 shrink-0" />
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="/home/usuario/Música"
              className="w-full bg-transparent font-mono text-[11px] text-slate-100 focus:outline-none"
            />
          </div>

          <button
            onClick={() => startDirectoryScan(explorer.currentPath)}
            disabled={scanStatus.is_scanning}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono shrink-0 transition cursor-pointer"
            title="Escanear recursivamente esta carpeta para añadirla a la biblioteca"
          >
            {scanStatus.is_scanning ? "Indexando..." : "Indexar"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 items-center">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5">
            <Search size={11} className="text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text"
              value={folderQuery}
              onChange={(e) => setFolderQuery(e.target.value)}
              placeholder="Filtrar en carpeta..."
              className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-2 py-0.5">
            <Search size={11} className="text-cyan-400 mr-1.5 shrink-0" />
            <input
              type="text"
              value={libraryQuery}
              onChange={(e) => {
                setLibraryQuery(e.target.value);
                fetchLibraryTracks(e.target.value);
              }}
              placeholder="Filtrar en biblioteca..."
              className="w-full bg-transparent text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            {librarySettings.musicFolder && (
              <button
                onClick={() => handleNavigate(librarySettings.musicFolder)}
                className="text-[9px] text-cyan-400 hover:text-cyan-300 ml-1 px-1 rounded bg-slate-900 border border-slate-800 font-mono shrink-0 cursor-pointer"
                title="Ir a carpeta raíz de biblioteca"
              >
                Raíz
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="h-7 bg-slate-950 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center px-2 shrink-0 select-none">
        <div
          onClick={() => handleColumnClick("name")}
          onDoubleClick={() => handleColumnDoubleClick("type")}
          className="relative cursor-pointer flex items-center gap-1 group hover:text-white truncate h-full"
          style={{ flex: `0 0 ${columnWidths.name}%` }}
          title="1 clic: ordenar / Doble clic: ocultar columna"
        >
          <span>Nombre</span>
          {renderSortIcon("name")}
          {visibleColumns.type && <ColumnResizeHandle onResize={(delta) => resizeColumns("name", "type", delta)} />}
        </div>

        {visibleColumns.type && (
          <div
            onClick={() => handleColumnClick("extension")}
            onDoubleClick={() => handleColumnDoubleClick("type")}
            className="relative text-center cursor-pointer flex items-center justify-center gap-1 group hover:text-white shrink-0 h-full"
            style={{ flex: `0 0 ${columnWidths.type}%` }}
            title="1 clic: ordenar / Doble clic: ocultar columna"
          >
            <span>Tipo</span>
            {renderSortIcon("extension")}
            {visibleColumns.size && <ColumnResizeHandle onResize={(delta) => resizeColumns("type", "size", delta)} />}
          </div>
        )}

        {visibleColumns.size && (
          <div
            onClick={() => handleColumnClick("size")}
            onDoubleClick={() => handleColumnDoubleClick("size")}
            className="relative text-right cursor-pointer flex items-center justify-end gap-1 group hover:text-white shrink-0 pr-2 h-full"
            style={{ flex: `0 0 ${columnWidths.size}%` }}
            title="1 clic: ordenar / Doble clic: ocultar columna"
          >
            <span>Tamaño</span>
            {renderSortIcon("size")}
            {visibleColumns.duration && <ColumnResizeHandle onResize={(delta) => resizeColumns("size", "duration", delta)} />}
          </div>
        )}

        {visibleColumns.duration && (
          <div
            onClick={() => handleColumnClick("duration")}
            onDoubleClick={() => handleColumnDoubleClick("duration")}
            className="relative text-right cursor-pointer flex items-center justify-end gap-1 group hover:text-white shrink-0 pr-2 h-full"
            style={{ flex: `0 0 ${columnWidths.duration}%` }}
            title="1 clic: ordenar / Doble clic: ocultar columna"
          >
            <span>Duración</span>
            {renderSortIcon("duration")}
            {visibleColumns.bitrate && <ColumnResizeHandle onResize={(delta) => resizeColumns("duration", "bitrate", delta)} />}
          </div>
        )}

        {visibleColumns.bitrate && (
          <div
            onClick={() => handleColumnClick("bitrate")}
            onDoubleClick={() => handleColumnDoubleClick("bitrate")}
            className="relative text-right cursor-pointer flex items-center justify-end gap-1 group hover:text-white shrink-0 pr-2 h-full"
            style={{ flex: `0 0 ${columnWidths.bitrate}%` }}
            title="1 clic: ordenar / Doble clic: ocultar columna"
          >
            <span>Bitrate</span>
            {renderSortIcon("bitrate")}
            {visibleColumns.action && <ColumnResizeHandle onResize={(delta) => resizeColumns("bitrate", "action", delta)} />}
          </div>
        )}

        {visibleColumns.action && (
          <div className="relative text-right pr-2 shrink-0 flex items-center justify-end gap-1 h-full" style={{ flex: `0 0 ${columnWidths.action}%` }}>
            <span>Acción</span>
            <button
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
              className="p-0.5 rounded hover:text-white text-slate-500 cursor-pointer"
              title="Configurar columnas visibles"
            >
              <SlidersHorizontal size={10} />
            </button>
          </div>
        )}
      </div>

      {isColMenuOpen && (
        <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between text-[10px] font-mono text-slate-300 gap-3">
          <span className="text-slate-400 font-bold">Columnas:</span>
          {(["type", "size", "duration", "bitrate", "action"] as const).map((col) => (
            <label key={col} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleColumns[col]}
                onChange={(e) =>
                  setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })
                }
                className="accent-cyan-400"
              />
              <span className="capitalize">{col}</span>
            </label>
          ))}
          <button
            onClick={() => setIsColMenuOpen(false)}
            className="text-xs text-slate-400 hover:text-white px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {explorer.currentPath && explorer.currentPath !== "/" && (
          <div
            onDoubleClick={navigateUp}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800/80 cursor-default text-cyan-400 font-bold border-b border-slate-800/60 mb-1 transition-colors"
            title="Subir de nivel en el directorio"
          >
            <ArrowUp size={13} className="text-cyan-400" />
            <span>..</span>
          </div>
        )}

        {explorer.error ? (
          <div className="p-4 text-center text-red-400 font-sans text-xs">
            {explorer.error}
          </div>
        ) : sortedAndFilteredEntries.length === 0 ? (
          <div className="p-4 text-center text-slate-500 font-sans text-xs">
            {explorer.isLoading
              ? "Cargando directorio..."
              : "Carpeta vacía o sin archivos coincidentes"}
          </div>
        ) : (
          sortedAndFilteredEntries.map((entry: FileNode) => (
            <ExplorerRow
              key={entry.path}
              entry={entry}
              visibleColumns={visibleColumns}
              columnWidths={columnWidths}
              durationSeconds={tracksByPath.get(entry.path)?.duration_seconds ?? null}
              onPlay={handleEntryPlay}
              onAddToQueue={handleEntryAddToQueue}
              onAddFolderToQueue={handleAddFolderToQueue}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>

      <div className="h-7 px-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
        <span className="shrink-0">{sortedAndFilteredEntries.length} elementos · {Math.floor(visibleKnownSeconds / 60)} min{visibleUnindexedCount > 0 ? ` · ${visibleUnindexedCount} sin indexar` : ""}</span>
        <span className="text-cyan-400 truncate max-w-[220px]" title={explorer.currentPath}>
          {explorer.currentPath}
        </span>
      </div>
    </div>
  );
};
