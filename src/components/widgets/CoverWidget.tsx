import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Disc3, Image as ImageIcon, Music2 } from "lucide-react";

export const CoverWidget: React.FC = () => {
  const { currentTrack, telemetry, currentCoverArt, appearance } = useMusicStore();

  const title = telemetry.track_title || currentTrack?.title || "musicx Hi-Fi";
  const artist = telemetry.track_artist || currentTrack?.artist || "Listo para reproducir";
  const album = telemetry.track_album || currentTrack?.album || "Sin Álbum";
  const isPlaying = telemetry.state === "Playing";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-1.5 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between shrink-0">
        <ImageIcon size={12} style={{ color: appearance.accentColor }} />
        <span
          className="font-mono text-[9px] px-1.5 py-0.2 rounded border border-slate-700 font-bold"
          style={{
            color: appearance.accentColor,
            backgroundColor: `${appearance.accentColor}15`,
          }}
        >
          {isPlaying ? "ART" : "STANDBY"}
        </span>
      </div>

      <div className="flex-1 p-4 flex flex-col items-center justify-center gap-3 overflow-hidden">
        {/* Vinyl / Cover Canvas */}
        <div
          className="relative w-48 h-48 max-w-[85%] aspect-square rounded-xl bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center group overflow-hidden transition-all duration-300"
          style={{
            borderColor: appearance.neonGlow ? `${appearance.accentColor}55` : undefined,
            boxShadow: appearance.neonGlow
              ? `0 0 25px ${appearance.accentColor}25`
              : "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {currentCoverArt ? (
            <img
              src={currentCoverArt}
              alt={album}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="relative flex flex-col items-center justify-center text-slate-600">
              <div
                className={`w-32 h-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900/80 shadow-inner ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "5s" }}
              >
                <div
                  className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center shadow-md"
                  style={{ backgroundColor: `${appearance.accentColor}20` }}
                >
                  <Music2 size={20} style={{ color: appearance.accentColor }} />
                </div>
              </div>
              <Disc3
                size={24}
                className="absolute text-slate-500 opacity-50 pointer-events-none"
              />
            </div>
          )}

          <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
            <span className="font-mono text-[9px] uppercase tracking-wider text-white bg-slate-950/85 px-2 py-0.5 rounded backdrop-blur border border-slate-700/60 block truncate shadow-lg">
              {album}
            </span>
          </div>
        </div>

        {/* Text info below cover */}
        <div className="text-center w-full px-2">
          <h3 className="font-bold text-sm text-white truncate" title={title}>
            {title}
          </h3>
          <p className="text-xs text-slate-400 truncate mt-0.5">{artist}</p>
        </div>
      </div>
    </div>
  );
};
