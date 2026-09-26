import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Disc3, Music2 } from "lucide-react";

export const CoverWidget: React.FC = () => {
  const { currentTrack, telemetry, currentCoverArt, appearance } = useMusicStore();

  const title = telemetry.track_title || currentTrack?.title || "musicx Hi-Fi";
  const artist = telemetry.track_artist || currentTrack?.artist || "Listo para reproducir";
  const album = telemetry.track_album || currentTrack?.album || "Sin Álbum";
  const isPlaying = telemetry.state === "Playing";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs justify-center items-center p-3">
      <div
        className="relative w-full max-w-[220px] aspect-square rounded-xl bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center group overflow-hidden transition-all duration-300 shrink-0"
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
              className={`w-28 h-28 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900/80 shadow-inner ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ animationDuration: "5s" }}
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center shadow-md"
                style={{ backgroundColor: `${appearance.accentColor}20` }}
              >
                <Music2 size={18} style={{ color: appearance.accentColor }} />
              </div>
            </div>
            <Disc3
              size={22}
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

      <div className="text-center w-full px-2 mt-2">
        <h3 className="font-bold text-xs text-white truncate" title={title}>
          {title}
        </h3>
        <p className="text-[11px] text-slate-400 truncate mt-0.5">{artist}</p>
      </div>
    </div>
  );
};
