import gzip
import hashlib
import json
from pathlib import Path

root = Path('docs/implementation')
records = []
for folder in ['audit-cpu-livraison-2026-10-22/preuves', 'audit-cpu-publication-2026-10-22/preuves']:
    for file in sorted((root/folder).glob('*.log')):
        original = file.read_bytes()
        text = original.decode('utf-8')
        readable = ('\n'.join(line.rstrip(' \t\r') for line in text.split('\n')).rstrip()+'\n').encode('utf-8') if original else original
        if readable == original:
            continue
        archive = file.with_suffix(file.suffix+'.gz')
        if archive.exists():
            # Retain the first raw capture when this tool is run again.
            raw = gzip.decompress(archive.read_bytes())
        else:
            raw = original
            archive.write_bytes(gzip.compress(raw, mtime=0))
        file.write_bytes(readable)
        records.append({'readable': str(file), 'rawArchive': str(archive), 'rawSha256': hashlib.sha256(raw).hexdigest(), 'readableSha256': hashlib.sha256(readable).hexdigest()})
if records:
    (root/'audit-cpu-publication-2026-10-22/preuves/raw-log-archives.json').write_text(json.dumps({'method': 'Only line-ending/trailing-whitespace normalization for readable logs; exact original bytes preserved in gzip archives.', 'files': records}, indent=2)+'\n', encoding='utf-8')
for file in [root/'audit-cpu-ecarts-2026-10-22.md', Path('scripts/cpu-audit/validate-release.mjs')]:
    file.write_text(file.read_text(encoding='utf-8-sig').rstrip()+'\n', encoding='utf-8', newline='\n')
print(json.dumps({'rawLogsArchived': len(records)}))
