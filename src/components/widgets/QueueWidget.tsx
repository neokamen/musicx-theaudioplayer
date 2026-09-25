import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { ListMusic, Trash2, Volume2 } from "lucide-react";
import type { Track } from "../../types/index.ts";

function formatDuration(sec: number): string {
  if (!sec || isNaN(sec)) return "0:00";
  const mins = Math.floor(sec / 60);
  const remainingSecs = Math.floor(sec % 60);
  return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
}

export const QueueWidget: React.FC = () => {
  const { queue, queueIndex, play, removeFromQueue, clearQueue, isPlaying } = useMusicStore();

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <ListMusic size={12} className="text-audiophile-cyan" />
          Cola Gapless ({queue.length})
        </span>
        {queue.length > 0 && (
          <button
            onClick={clearQueue}
            className="text-[10px] text-red-400 hover:text-red-300 font-mono flex items-center gap-1 transition-colors"
            title="Vaciar cola"
          >
            <Trash2 size={11} /> Limpiar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-1 font-mono text-[11px]">
        {queue.length === 0 ? (
          <div className="p-6 text-center text-audiophile-muted font-sans text-xs">
            La cola está vacía. Añade pistas desde la biblioteca o carpetas.
          </div>
        ) : (
          queue.map((track: Track, idx: number) => {
            const isCurrent = idx === queueIndex;

            return (
              <div
                key={`${track.filepath}-${idx}`}
                onDoubleClick={() => play(track)}
                className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-audiophile-surface2 cursor-pointer group transition-colors ${
                  isCurrent ? "bg-audiophile-cyan/15 text-audiophile-cyan font-semibold" : "text-audiophile-text"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="w-5 text-center text-[10px] text-audiophile-muted">
                    {isCurrent && isPlaying ? (
                      <Volume2 size={12} className="inline text-audiophile-cyan animate-pulse" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <div className="truncate">
                    <span className="truncate block">{track.title}</span>
                    <span className="text-[10px] text-audiophile-muted truncate block">
                      {track.artist}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-audiophile-muted">
                    {formatDuration(track.duration_seconds)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(idx);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    title="Quitar de la cola"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
