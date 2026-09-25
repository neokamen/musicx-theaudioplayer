import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Disc3, Image as ImageIcon } from "lucide-react";

export const CoverWidget: React.FC = () => {
  const { currentTrack, telemetry, currentCoverArt } = useMusicStore();

  const title = telemetry.track_title || currentTrack?.title || "Ninguna pista seleccionada";
  const artist = telemetry.track_artist || currentTrack?.artist || "musicx Hi-Fi";
  const album = telemetry.track_album || currentTrack?.album || "Sin álbum";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <ImageIcon size={12} className="text-audiophile-cyan" />
          Carátula del Álbum
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-audiophile-border text-audiophile-text">
          ARTWORK
        </span>
      </div>

      <div className="flex-1 overflow-hidden p-4 flex flex-col items-center justify-center gap-3">
        <div className="relative aspect-square max-h-[82%] max-w-[85%] rounded-xl bg-audiophile-base border border-audiophile-border shadow-2xl flex items-center justify-center group overflow-hidden">
          {currentCoverArt ? (
            <img
              src={currentCoverArt}
              alt={album}
              className="w-full h-full object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-tr from-audiophile-surface to-transparent opacity-60" />
              <Disc3
                size={80}
                className={`text-audiophile-muted/40 transition-transform duration-1000 ${
                  telemetry.state === "Playing" ? "animate-spin text-audiophile-cyan/50" : ""
                }`}
                style={{ animationDuration: "6s" }}
              />
            </>
          )}

          <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
            <span className="font-mono text-[9px] uppercase tracking-wider text-white bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur border border-slate-700/50 block truncate shadow-md">
              {album}
            </span>
          </div>
        </div>

        <div className="text-center w-full px-2 overflow-hidden">
          <h3 className="font-bold text-xs text-white truncate" title={title}>
            {title}
          </h3>
          <p className="text-audiophile-muted text-[11px] truncate mt-0.5" title={artist}>
            {artist}
          </p>
        </div>
      </div>
    </div>
  );
};
