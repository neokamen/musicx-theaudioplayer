import React, { useState, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMusicStore } from "../../store/index.ts";
import {
  Search,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Play,
  Plus,
  Volume2,
  SlidersHorizontal,
} from "lucide-react";
import type { Track } from "../../types/index.ts";

import { ColumnResizeHandle } from "./ColumnResizeHandle.tsx";

type TrackColumn = "track" | "title" | "artist" | "album" | "format" | "bitrate" | "duration";
type TrackColumnWidths = Record<TrackColumn, number>;
function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.floor(sec % 60);
  return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
}

type SortField =
  | "track_number"
  | "title"
  | "artist"
  | "album"
  | "duration_seconds"
  | "format"
  | "bitrate_kbps";

type SortDirection = "asc" | "desc";

export const VirtualTrackList: React.FC = () => {
  const {
    libraryTracks,
    currentTrack,
    currentCoverArt,
    playbackSettings,
    isPlaying,
    setQueue,
    addToQueue,
    fetchLibraryTracks,
    scanStatus,
  } = useMusicStore();

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("artist");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [columnWidths, setColumnWidths] = useState<TrackColumnWidths>({
    track: 6, title: 33, artist: 18, album: 18, format: 10, bitrate: 8, duration: 7,
  });
  const [visibleCols, setVisibleCols] = useState({
    artist: true,
    album: true,
    format: true,
    bitrate: true,
    duration: true,
  });
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    track: Track;
  } | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  const tableWidthRef = useRef<HTMLDivElement>(null);

  const resizeColumns = (left: TrackColumn, right: TrackColumn, deltaPixels: number) => {
    const totalWidth = tableWidthRef.current?.clientWidth || 1;
    const delta = (deltaPixels / totalWidth) * 100;
    setColumnWidths((widths) => {
      const adjusted = Math.max(5, Math.min(70, widths[left] + delta));
      const appliedDelta = adjusted - widths[left];
      return { ...widths, [left]: adjusted, [right]: Math.max(5, widths[right] - appliedDelta) };
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    fetchLibraryTracks(q);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTracks = useMemo(() => {
    return [...libraryTracks].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA === null || valA === undefined) valA = "" as never;
      if (valB === null || valB === undefined) valB = "" as never;
      let comp = 0;
      if (typeof valA === "string" && typeof valB === "string") {
        comp = valA.localeCompare(valB, undefined, { sensitivity: "base" });
      } else {
        comp = (valA as number) > (valB as number) ? 1 : (valA as number) < (valB as number) ? -1 : 0;
      }
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [libraryTracks, sortField, sortDirection]);
  const visibleDurationSeconds = sortedTracks.reduce((sum, track) => sum + Math.max(0, track.duration_seconds || 0), 0);

  const rowVirtualizer = useVirtualizer({
    count: sortedTracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 20,
  });

  const handleRowDoubleClick = (_track: Track, index: number) => {
    setQueue(sortedTracks, index);
  };

  const handleContextMenu = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, track });
  };

  const closeContextMenu = () => setContextMenu(null);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={10} className="opacity-0 group-hover/col:opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={11} className="text-audiophile-cyan" />
    ) : (
      <ArrowDown size={11} className="text-audiophile-cyan" />
    );
  };

  return (
    <div
      ref={tableWidthRef}
      className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans text-xs overflow-hidden"
      onClick={closeContextMenu}
    >
      {/* Barra superior: Búsqueda y Estado de Escaneo */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between gap-3 shrink-0">
        <div className="flex-1 flex items-center bg-audiophile-base border border-audiophile-border rounded px-2.5 py-1">
          <Search size={13} className="text-audiophile-muted mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar entre miles de pistas por título, artista, álbum..."
            className="w-full bg-transparent font-mono text-[11px] text-audiophile-text placeholder-audiophile-muted/50 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {scanStatus.is_scanning && (
            <div className="flex items-center gap-1.5 text-audiophile-amber text-[10px] font-mono animate-pulse">
              <RefreshCw size={11} className="animate-spin" />
              <span>
                Indexando {scanStatus.current}/{scanStatus.total}
              </span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Personalizar columnas visibles"
            >
              <SlidersHorizontal size={13} />
            </button>

            {isColMenuOpen && (
              <div className="absolute top-8 right-0 w-44 p-2 bg-slate-950 border border-slate-700 shadow-2xl rounded-lg z-50 font-mono text-[10px] space-y-1.5">
                <div className="text-slate-400 font-bold border-b border-slate-800 pb-1">Columnas de Biblioteca</div>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Artista</span>
                  <input
                    type="checkbox"
                    checked={visibleCols.artist}
                    onChange={(e) => setVisibleCols({ ...visibleCols, artist: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Álbum</span>
                  <input
                    type="checkbox"
                    checked={visibleCols.album}
                    onChange={(e) => setVisibleCols({ ...visibleCols, album: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Formato</span>
                  <input
                    type="checkbox"
                    checked={visibleCols.format}
                    onChange={(e) => setVisibleCols({ ...visibleCols, format: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Bitrate</span>
                  <input
                    type="checkbox"
                    checked={visibleCols.bitrate}
                    onChange={(e) => setVisibleCols({ ...visibleCols, bitrate: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer text-slate-200">
                  <span>Duración</span>
                  <input
                    type="checkbox"
                    checked={visibleCols.duration}
                    onChange={(e) => setVisibleCols({ ...visibleCols, duration: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </label>
              </div>
            )}
          </div>

          <button
            onClick={() => fetchLibraryTracks(search)}
            className="p-1.5 rounded hover:bg-audiophile-border text-audiophile-text transition-colors"
            title="Recargar canciones desde SQLite"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Encabezado fijo de columnas ordenables con alineación perfecta */}
      <div className="h-8 bg-audiophile-base border-b border-audiophile-border text-[10px] font-mono text-audiophile-muted uppercase tracking-wider flex items-center px-3 shrink-0">
        <div
          onClick={() => handleSort("track_number")}
          className="w-10 text-center cursor-pointer flex items-center justify-center gap-1 group/col hover:text-white shrink-0"
          style={{ flex: `0 0 ${columnWidths.track}%` }}
        >
          <span>#</span>
          {renderSortIndicator("track_number")}
        </div>

        <div
          onClick={() => handleSort("title")}
          className="relative min-w-0 cursor-pointer flex items-center gap-1 group/col hover:text-white pr-2 truncate"
          style={{ flex: `0 0 ${columnWidths.title}%` }}
        >
          <span>Título</span>
          {renderSortIndicator("title")}
          {visibleCols.artist && <ColumnResizeHandle onResize={(delta) => resizeColumns("title", "artist", delta)} />}
        </div>

        {visibleCols.artist && (
          <div
            onClick={() => handleSort("artist")}
            className="relative cursor-pointer flex items-center gap-1 group/col hover:text-white shrink-0 pr-2 truncate"
            style={{ flex: `0 0 ${columnWidths.artist}%` }}
          >
            <span>Artista</span>
            {renderSortIndicator("artist")}
            {visibleCols.album && <ColumnResizeHandle onResize={(delta) => resizeColumns("artist", "album", delta)} />}
          </div>
        )}

        {visibleCols.album && (
          <div
            onClick={() => handleSort("album")}
            className="relative cursor-pointer flex items-center gap-1 group/col hover:text-white shrink-0 pr-2 truncate"
            style={{ flex: `0 0 ${columnWidths.album}%` }}
          >
            <span>Álbum</span>
            {renderSortIndicator("album")}
            {visibleCols.format && <ColumnResizeHandle onResize={(delta) => resizeColumns("album", "format", delta)} />}
          </div>
        )}

        {visibleCols.format && (
          <div
            onClick={() => handleSort("format")}
            className="relative w-20 text-center cursor-pointer flex items-center justify-center gap-1 group/col hover:text-white shrink-0"
            style={{ flex: `0 0 ${columnWidths.format}%` }}
          >
            <span>Formato</span>
            {renderSortIndicator("format")}
            {visibleCols.bitrate && <ColumnResizeHandle onResize={(delta) => resizeColumns("format", "bitrate", delta)} />}
          </div>
        )}

        {visibleCols.bitrate && (
          <div
            onClick={() => handleSort("bitrate_kbps")}
            className="relative w-20 text-right cursor-pointer flex items-center justify-end gap-1 group/col hover:text-white shrink-0 pr-2"
            style={{ flex: `0 0 ${columnWidths.bitrate}%` }}
          >
            <span>Bitrate</span>
            {renderSortIndicator("bitrate_kbps")}
            {visibleCols.duration && <ColumnResizeHandle onResize={(delta) => resizeColumns("bitrate", "duration", delta)} />}
          </div>
        )}

        {visibleCols.duration && (
          <div
            onClick={() => handleSort("duration_seconds")}
            className="w-16 text-right cursor-pointer flex items-center justify-end gap-1 group/col hover:text-white shrink-0"
            style={{ flex: `0 0 ${columnWidths.duration}%` }}
          >
            <span>Duración</span>
            {renderSortIndicator("duration_seconds")}
          </div>
        )}
      </div>

      {/* Contenedor Virtualizado con @tanstack/react-virtual */}
      <div ref={parentRef} className="flex-1 overflow-y-auto w-full relative">
        {/* Difuminado de la carátula del álbum en el fondo de la lista */}
        {playbackSettings?.diffuseAlbumArt && currentCoverArt && (
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center filter blur-3xl transition-opacity duration-700"
            style={{
              backgroundImage: `url(${currentCoverArt})`,
              opacity: (playbackSettings.diffuseAlbumArtOpacity ?? 25) / 100,
            }}
          />
        )}

        {sortedTracks.length === 0 ? (
          <div className="relative z-10 py-20 text-center text-audiophile-muted font-sans text-xs">
            {scanStatus.is_scanning
              ? "Indexando archivos de audio en segundo plano..."
              : "No se encontraron temas en la base de datos."}
          </div>
        ) : (
          <div
            className="relative z-10"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const track = sortedTracks[virtualRow.index];
              const isCurrent = currentTrack?.filepath === track.filepath;

              return (
                <div
                  key={track.filepath}
                  onClick={() => handleRowDoubleClick(track, virtualRow.index)}
                  onDoubleClick={() => handleRowDoubleClick(track, virtualRow.index)}
                  onContextMenu={(e) => handleContextMenu(e, track)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className={`flex items-center px-3 hover:bg-audiophile-surface2/80 cursor-pointer font-mono text-[11px] group transition-colors ${
                    isCurrent
                      ? "bg-audiophile-cyan/15 text-audiophile-cyan font-semibold"
                      : "text-audiophile-text"
                  }`}
                >
                  <div className="w-10 text-center text-audiophile-muted shrink-0" style={{ flex: `0 0 ${columnWidths.track}%` }}>
                    {isCurrent && isPlaying ? (
                      <Volume2 size={12} className="inline text-audiophile-cyan animate-pulse" />
                    ) : (
                      track.track_number || virtualRow.index + 1
                    )}
                  </div>

                  <div className="min-w-0 truncate pr-2" style={{ flex: `0 0 ${columnWidths.title}%` }}>
                    <span className="truncate group-hover:text-white hover-marquee" title={track.title}>
                      {track.title}
                    </span>
                  </div>

                  {visibleCols.artist && (
                    <div className="w-40 text-audiophile-muted group-hover:text-audiophile-text truncate pr-2 shrink-0" style={{ flex: `0 0 ${columnWidths.artist}%` }}>
                      {track.artist}
                    </div>
                  )}

                  {visibleCols.album && (
                    <div className="w-40 text-audiophile-muted group-hover:text-audiophile-text truncate pr-2 shrink-0" style={{ flex: `0 0 ${columnWidths.album}%` }}>
                      {track.album}
                    </div>
                  )}

                  {visibleCols.format && (
                    <div className="w-20 text-center shrink-0" style={{ flex: `0 0 ${columnWidths.format}%` }}>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-audiophile-border/80 font-medium text-slate-300">
                        {track.format} {track.bit_depth > 0 ? `${track.bit_depth}b` : ""}
                      </span>
                    </div>
                  )}

                  {visibleCols.bitrate && (
                    <div className="w-20 text-right text-audiophile-muted shrink-0 text-[10px] pr-2" style={{ flex: `0 0 ${columnWidths.bitrate}%` }}>
                      {track.bitrate_kbps > 0 ? `${track.bitrate_kbps}k` : "---"}
                    </div>
                  )}

                  {visibleCols.duration && (
                    <div className="w-16 text-right text-audiophile-muted shrink-0" style={{ flex: `0 0 ${columnWidths.duration}%` }}>
                      {formatDuration(track.duration_seconds)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Menú contextual (Clic Derecho) */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-audiophile-surface2 border border-audiophile-border shadow-2xl rounded p-1 font-mono text-[11px] text-audiophile-text flex flex-col min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setQueue([contextMenu.track], 0);
              closeContextMenu();
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-audiophile-cyan/20 hover:text-audiophile-cyan rounded text-left transition-colors"
          >
            <Play size={12} fill="currentColor" />
            <span>Reproducir ahora</span>
          </button>
          <button
            onClick={() => {
              addToQueue(contextMenu.track);
              closeContextMenu();
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-audiophile-cyan/20 hover:text-audiophile-cyan rounded text-left transition-colors"
          >
            <Plus size={12} />
            <span>Añadir a la cola</span>
          </button>
        </div>
      )}

      {/* Pie de estado de biblioteca */}
      <div className="h-6 px-3 border-t border-audiophile-border bg-audiophile-surface2 flex items-center justify-between text-[10px] font-mono text-audiophile-muted shrink-0">
        <span>{sortedTracks.length} canciones · {Math.floor(visibleDurationSeconds / 60)} min visibles</span>
        <span className="text-audiophile-green">VIRTUAL RENDERER: 60+ FPS</span>
      </div>
    </div>
  );
};
