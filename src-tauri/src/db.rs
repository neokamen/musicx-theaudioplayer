use crate::models::{ScanProgress, TrackMetadata};
use jwalk::WalkDir;
use rusqlite::{params, Connection};
use std::fs::File;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use symphonia::core::formats::FormatOptions;
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::{MetadataOptions, Tag};
use symphonia::core::probe::Hint;
use tauri::{AppHandle, Emitter};

pub struct DatabaseManager {
    conn: Mutex<Connection>,
}

impl DatabaseManager {
    pub fn new<P: AsRef<Path>>(db_path: P) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(db_path)?;

        // WAL mode for high concurrency and fast write throughput
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;
        conn.pragma_update(None, "temp_store", "MEMORY")?;
        conn.pragma_update(None, "cache_size", -64000)?; // 64MB cache

        conn.execute(
            "CREATE TABLE IF NOT EXISTS tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filepath TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                artist TEXT NOT NULL,
                album TEXT NOT NULL,
                track_number INTEGER,
                duration_seconds REAL NOT NULL,
                format TEXT NOT NULL,
                sample_rate INTEGER NOT NULL,
                bit_depth INTEGER NOT NULL,
                bitrate_kbps INTEGER NOT NULL,
                file_size INTEGER NOT NULL,
                mtime INTEGER NOT NULL
            );",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_tracks_filepath ON tracks (filepath);",
            [],
        )?;
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_tracks_artist_album ON tracks (artist, album);",
            [],
        )?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn get_mtime(&self, filepath: &str) -> Option<i64> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare_cached("SELECT mtime FROM tracks WHERE filepath = ?1 LIMIT 1")
            .ok()?;
        stmt.query_row(params![filepath], |row| row.get(0)).ok()
    }

    pub fn upsert_track(&self, track: &TrackMetadata) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO tracks (
                filepath, title, artist, album, track_number,
                duration_seconds, format, sample_rate, bit_depth,
                bitrate_kbps, file_size, mtime
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
            ON CONFLICT(filepath) DO UPDATE SET
                title = excluded.title,
                artist = excluded.artist,
                album = excluded.album,
                track_number = excluded.track_number,
                duration_seconds = excluded.duration_seconds,
                format = excluded.format,
                sample_rate = excluded.sample_rate,
                bit_depth = excluded.bit_depth,
                bitrate_kbps = excluded.bitrate_kbps,
                file_size = excluded.file_size,
                mtime = excluded.mtime;",
            params![
                track.filepath,
                track.title,
                track.artist,
                track.album,
                track.track_number,
                track.duration_seconds,
                track.format,
                track.sample_rate,
                track.bit_depth,
                track.bitrate_kbps,
                track.file_size,
                track.mtime,
            ],
        )?;
        Ok(())
    }

    pub fn get_all_tracks(&self) -> Result<Vec<TrackMetadata>, rusqlite::Error> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, filepath, title, artist, album, track_number, duration_seconds, format, sample_rate, bit_depth, bitrate_kbps, file_size, mtime
             FROM tracks ORDER BY artist ASC, album ASC, track_number ASC",
        )?;

        let tracks = stmt
            .query_map([], |row| {
                Ok(TrackMetadata {
                    id: Some(row.get(0)?),
                    filepath: row.get(1)?,
                    title: row.get(2)?,
                    artist: row.get(3)?,
                    album: row.get(4)?,
                    track_number: row.get(5)?,
                    duration_seconds: row.get(6)?,
                    format: row.get(7)?,
                    sample_rate: row.get(8)?,
                    bit_depth: row.get(9)?,
                    bitrate_kbps: row.get(10)?,
                    file_size: row.get(11)?,
                    mtime: row.get(12)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(tracks)
    }

    pub fn get_track_by_path(&self, filepath: &str) -> Option<TrackMetadata> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare_cached(
                "SELECT id, filepath, title, artist, album, track_number, duration_seconds, format, sample_rate, bit_depth, bitrate_kbps, file_size, mtime
                 FROM tracks WHERE filepath = ?1 LIMIT 1",
            )
            .ok()?;

        stmt.query_row(params![filepath], |row| {
            Ok(TrackMetadata {
                id: Some(row.get(0)?),
                filepath: row.get(1)?,
                title: row.get(2)?,
                artist: row.get(3)?,
                album: row.get(4)?,
                track_number: row.get(5)?,
                duration_seconds: row.get(6)?,
                format: row.get(7)?,
                sample_rate: row.get(8)?,
                bit_depth: row.get(9)?,
                bitrate_kbps: row.get(10)?,
                file_size: row.get(11)?,
                mtime: row.get(12)?,
            })
        })
        .ok()
    }
}

/// Extrae metadatos precisos utilizando Symphonia
pub fn extract_metadata(path: &Path) -> Option<TrackMetadata> {
    let file = File::open(path).ok()?;
    let meta = file.metadata().ok()?;
    let file_size = meta.len();
    let mtime = meta
        .modified()
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    let ext = path.extension()?.to_str()?.to_lowercase();
    let mut hint = Hint::new();
    hint.with_extension(&ext);

    let mss = MediaSourceStream::new(Box::new(file), Default::default());
    let format_opts = FormatOptions {
        enable_gapless: true,
        ..Default::default()
    };
    let metadata_opts = MetadataOptions::default();

    let probed = symphonia::default::get_probe()
        .format(&hint, mss, &format_opts, &metadata_opts)
        .ok()?;

    let mut reader = probed.format;
    let track = reader.default_track()?;
    let params = &track.codec_params;

    let sample_rate = params.sample_rate.unwrap_or(44_100);
    let bit_depth = params.bits_per_sample.unwrap_or(16) as u16;

    let duration_seconds = if let (Some(n_frames), Some(time_base)) = (params.n_frames, params.time_base) {
        let time = time_base.calc_time(n_frames);
        time.seconds as f64 + time.frac
    } else {
        0.0
    };

    let bitrate_kbps = if duration_seconds > 0.0 {
        ((file_size as f64 * 8.0) / (duration_seconds * 1000.0)).round() as u32
    } else {
        0
    };

    // Extract tags from format metadata or container metadata
    let mut title = None;
    let mut artist = None;
    let mut album = None;
    let mut track_number = None;

    let parse_tags = |tags: &[Tag], t: &mut Option<String>, a: &mut Option<String>, alb: &mut Option<String>, tr: &mut Option<u32>| {
        for tag in tags {
            let key = tag.std_key;
            let val = tag.value.to_string();
            match key {
                Some(symphonia::core::meta::StandardTagKey::TrackTitle) => {
                    if t.is_none() { *t = Some(val); }
                }
                Some(symphonia::core::meta::StandardTagKey::Artist) |
                Some(symphonia::core::meta::StandardTagKey::AlbumArtist) => {
                    if a.is_none() { *a = Some(val); }
                }
                Some(symphonia::core::meta::StandardTagKey::Album) => {
                    if alb.is_none() { *alb = Some(val); }
                }
                Some(symphonia::core::meta::StandardTagKey::TrackNumber) => {
                    if tr.is_none() {
                        let parsed = val.split('/').next().and_then(|v| v.trim().parse::<u32>().ok());
                        *tr = parsed;
                    }
                }
                _ => {}
            }
        }
    };

    if let Some(metadata) = reader.metadata().current() {
        parse_tags(metadata.tags(), &mut title, &mut artist, &mut album, &mut track_number);
    }

    let default_title = path.file_stem().and_then(|s| s.to_str()).unwrap_or("Pista Desconocida").to_string();

    Some(TrackMetadata {
        id: None,
        filepath: path.to_string_lossy().to_string(),
        title: title.unwrap_or(default_title),
        artist: artist.unwrap_or_else(|| "Artista Desconocido".to_string()),
        album: album.unwrap_or_else(|| "Álbum Desconocido".to_string()),
        track_number,
        duration_seconds,
        format: ext.to_uppercase(),
        sample_rate,
        bit_depth,
        bitrate_kbps,
        file_size,
        mtime,
    })
}

/// Escanea de forma multi-hilo e incremental con jwalk, omitiendo archivos no modificados
pub fn scan_directory_incremental(
    dir_path: PathBuf,
    db: Arc<DatabaseManager>,
    app_handle: AppHandle,
) {
    std::thread::spawn(move || {
        let mut audio_paths = Vec::new();

        // 1. Recolectar rutas de archivos soportados
        for entry in WalkDir::new(&dir_path).skip_hidden(true).follow_links(true) {
            if let Ok(entry) = entry {
                if entry.file_type().is_file() {
                    let path = entry.path();
                    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                        match ext.to_lowercase().as_str() {
                            "flac" | "wav" | "wave" | "mp3" | "m4a" | "aac" | "ogg" | "opus" => {
                                audio_paths.push(path);
                            }
                            _ => {}
                        }
                    }
                }
            }
        }

        let total_files = audio_paths.len();
        let mut scanned_files = 0;

        for path in audio_paths {
            scanned_files += 1;
            let path_str = path.to_string_lossy().to_string();

            let file_mtime = std::fs::metadata(&path)
                .ok()
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs() as i64)
                .unwrap_or(0);

            // Comparar mtime con la base de datos
            let cached_mtime = db.get_mtime(&path_str);
            let needs_update = match cached_mtime {
                Some(cached) => cached < file_mtime,
                None => true,
            };

            if needs_update {
                if let Some(track) = extract_metadata(&path) {
                    let _ = db.upsert_track(&track);
                }
            }

            // Emitir evento cada 25 archivos o al finalizar para no sobrecargar el bus IPC
            if scanned_files % 25 == 0 || scanned_files == total_files {
                let _ = app_handle.emit(
                    "scan-progress",
                    ScanProgress {
                        scanned_files,
                        total_files,
                        current_path: path_str,
                        is_finished: scanned_files == total_files,
                    },
                );
            }
        }

        let _ = app_handle.emit(
            "scan-progress",
            ScanProgress {
                scanned_files: total_files,
                total_files,
                current_path: String::new(),
                is_finished: true,
            },
        );
    });
}
