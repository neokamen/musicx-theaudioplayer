use crate::models::FileEntry;
use std::fs;
use std::path::Path;

/// Reads only immediate children of a directory without recursive traversal or parsing
/// metadata tags, optimizing response times over network mounts (NFS, SSHFS, SMB).
pub fn read_directory_lazy_internal(path: String) -> Result<Vec<FileEntry>, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("Directorio no existe: {}", path));
    }
    if !p.is_dir() {
        return Err(format!("La ruta no es un directorio: {}", path));
    }

    let read_dir = fs::read_dir(p).map_err(|e| format!("Error al leer directorio {}: {}", path, e))?;

    let mut entries = Vec::new();

    for entry in read_dir.flatten() {
        let file_type = match entry.file_type() {
            Ok(ft) => ft,
            Err(_) => continue,
        };

        let file_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Omit hidden files/directories (.git, .hidden, etc.)
        if name.starts_with('.') {
            continue;
        }

        let is_dir = file_type.is_dir();
        let size = if is_dir {
            0
        } else {
            entry.metadata().map(|m| m.len()).unwrap_or(0)
        };

        let extension = file_path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase());

        // Filter: only show directories or supported audio/playlist files
        if !is_dir {
            if let Some(ref ext) = extension {
                match ext.as_str() {
                    "flac" | "wav" | "wave" | "mp3" | "m4a" | "aac" | "ogg" | "opus" | "m3u" | "m3u8" => {}
                    _ => continue,
                }
            } else {
                continue;
            }
        }

        entries.push(FileEntry {
            name,
            path: file_path.to_string_lossy().to_string(),
            is_dir,
            size,
            extension,
        });
    }

    // Sort folders first, then alphabetical by name (case-insensitive)
    entries.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}
