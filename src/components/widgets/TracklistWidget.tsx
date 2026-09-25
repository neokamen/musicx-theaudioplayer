import React, { useState } from "react";
import { useMusicStore } from "../../store/index.ts";
import { Search, Play, Plus, RefreshCw } from "lucide-react";
import type { Track } from "../../types/index.ts";

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.floor(sec % 60);
  return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
}

export const TracklistWidget: React.FC = () => {
  const {
    libraryTracks,
    currentTrack,
    isPlaying,
    setQueue,
    addToQueue,
    fetchLibraryTracks,
    scanStatus,
  } = useMusicStore();

  const [search, setSearch] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    fetchLibraryTracks(q);
  };

  const handlePlayTrack = (_track: Track, index: number) => {
    setQueue(libraryTracks, index);
  };

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans text-xs">
      {/* Header con búsqueda y estado */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center bg-audiophile-base border border-audiophile-border rounded px-2.5 py-1">
          <Search size={13} className="text-audiophile-muted mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar por título, artista, álbum o formato..."
            className="w-full bg-transparent font-mono text-[11px] text-audiophile-text placeholder-audiophile-muted/60 focus:outline-none"
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
          <button
            onClick={() => fetchLibraryTracks(search)}
            className="p-1.5 rounded hover:bg-audiophile-border text-audiophile-text transition-colors"
            title="Refrescar lista"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Tabla Virtual de Canciones */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-[11px] font-mono">
          <thead className="sticky top-0 bg-audiophile-base/95 backdrop-blur border-b border-audiophile-border text-[10px] text-audiophile-muted uppercase tracking-wider">
            <tr>
              <th className="py-2 px-3 w-10 text-center">#</th>
              <th className="py-2 px-3">Título</th>
              <th className="py-2 px-3">Artista</th>
              <th className="py-2 px-3">Álbum</th>
              <th className="py-2 px-3 text-center">Formato</th>
              <th className="py-2 px-3 text-right">Duración</th>
              <th className="py-2 px-3 w-16 text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            {libraryTracks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-audiophile-muted font-sans text-xs">
                  {scanStatus.is_scanning
                    ? "Escaneando biblioteca..."
                    : "No hay canciones en la biblioteca. Selecciona una carpeta en el explorador e indexa."}
                </td>
              </tr>
            ) : (
              libraryTracks.map((track: Track, idx: number) => {
                const isCurrent = currentTrack?.filepath === track.filepath;

                return (
                  <tr
                    key={track.filepath}
                    onDoubleClick={() => handlePlayTrack(track, idx)}
                    className={`border-b border-audiophile-border/40 hover:bg-audiophile-surface2/80 cursor-pointer group transition-colors ${
                      isCurrent ? "bg-audiophile-cyan/10 text-audiophile-cyan" : "text-audiophile-text"
                    }`}
                  >
                    <td className="py-1.5 px-3 text-center text-audiophile-muted group-hover:text-white">
                      {isCurrent && isPlaying ? (
                        <span className="w-2 h-2 rounded-full bg-audiophile-cyan inline-block animate-pulse" />
                      ) : (
                        track.track_number || idx + 1
                      )}
                    </td>
                    <td className="py-1.5 px-3 font-semibold truncate max-w-[200px]">
                      {track.title}
                    </td>
                    <td className="py-1.5 px-3 truncate max-w-[150px] text-audiophile-muted group-hover:text-audiophile-text">
                      {track.artist}
                    </td>
                    <td className="py-1.5 px-3 truncate max-w-[150px] text-audiophile-muted group-hover:text-audiophile-text">
                      {track.album}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-audiophile-border font-medium">
                        {track.format} {track.bit_depth > 0 ? `${track.bit_depth}b` : ""}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-right text-audiophile-muted">
                      {formatDuration(track.duration_seconds)}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayTrack(track, idx);
                          }}
                          className="p-1 hover:text-audiophile-cyan"
                          title="Reproducir"
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(track);
                          }}
                          className="p-1 hover:text-audiophile-cyan"
                          title="Añadir a la cola"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de estado de biblioteca */}
      <div className="h-6 px-3 border-t border-audiophile-border bg-audiophile-surface2 flex items-center justify-between text-[10px] font-mono text-audiophile-muted">
        <span>{libraryTracks.length} pistas en base de datos SQLite</span>
        <span className="text-audiophile-amber">RUSQLITE WAL MODE</span>
      </div>
    </div>
  );
};
