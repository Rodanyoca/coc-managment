"""Create reviewable patches; apply checks mutate temporary directories only."""
from pathlib import Path
import difflib
import hashlib
import json
import subprocess
import tempfile

ROOT = Path.cwd()
BASELINE = json.loads((ROOT / '.cache/cpu-audit/baseline.json').read_text(encoding='utf-8'))
HEAD = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
if HEAD != BASELINE['head']:
    raise RuntimeError('HEAD changed: review the reference before preparing delivery')
OUT = ROOT / 'docs/implementation/audit-cpu-livraison-2026-10-22'
OUT.mkdir(exist_ok=True)
GROUPS = {
    '00-support-tests': ['package.json', 'scripts/cpu-audit/module-harness.mjs', 'scripts/cpu-audit/fixtures.mjs'],
    'D1-documents': ['lib/documents/data.ts', 'tests/cpu/documents.test.mjs', 'tests/cpu/private-documents.test.mjs'],
    'C1-sheets': ['lib/google/sheets.ts', 'tests/cpu/sheets.test.mjs'],
    'S1-viewer': ['lib/auth.ts', 'lib/auth/authorization.ts', 'lib/auth/post-login-route.ts', 'tests/unit/authorization.test.ts', 'tests/unit/post-login-route.test.ts', 'tests/cpu/navigation-access.test.mjs'],
}
RUNTIME = {'lib/documents/data.ts', 'lib/google/sheets.ts', 'lib/auth.ts', 'lib/auth/authorization.ts', 'lib/auth/post-login-route.ts'}
def digest(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest() if text is not None else None

def before(file, base):
    if base == 'baseline-workspace':
        if file not in BASELINE['files']:
            return None
        source = Path(BASELINE['destination']) / file
        raw = source.read_bytes()
        if hashlib.sha256(raw).hexdigest() != BASELINE['files'][file]:
            raise RuntimeError(f'Reference drift: {file}')
        return raw.decode('utf-8').replace('\r\n', '\n')
    result = subprocess.run(['git', 'show', f'{HEAD}:{file}'], capture_output=True)
    return result.stdout.decode('utf-8').replace('\r\n', '\n') if result.returncode == 0 else None

manifest = {'head': HEAD, 'lineEndings': 'SHA-256 and patches normalized to LF', 'groups': GROUPS, 'runtimeFiles': sorted(RUNTIME), 'families': {}}
for base in ['baseline-workspace', 'head']:
    folder = OUT / base
    folder.mkdir(exist_ok=True)
    check = Path(tempfile.mkdtemp(prefix='coc-delivery-check-'))
    items = []
    patches = []
    for group, files in GROUPS.items():
        patch = []
        for file in files:
            old = before(file, base)
            new = (ROOT / file).read_text(encoding='utf-8')
            if old is not None:
                target = check / file
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(old, encoding='utf-8', newline='\n')
            patch.extend(difflib.unified_diff((old or '').splitlines(keepends=True), new.splitlines(keepends=True), fromfile=f'a/{file}' if old is not None else '/dev/null', tofile=f'b/{file}'))
            items.append({'group': group, 'file': file, 'runtime': file in RUNTIME, 'beforeSha256': digest(old), 'afterSha256': digest(new), 'preexistingWorkspaceDifferenceFromHead': before(file, 'head') != before(file, 'baseline-workspace')})
        target_patch = folder / f'{group}.patch'
        target_patch.write_text(''.join('\n' if line == ' \n' else line for line in patch), encoding='utf-8', newline='\n')
        patches.append(target_patch)
    # No Git index or source workspace is changed. The check folder is disposable.
    for patch in patches:
        subprocess.run(['git', 'apply', '--check', str(patch)], cwd=check, check=True)
        subprocess.run(['git', 'apply', str(patch)], cwd=check, check=True)
    for item in items:
        assert digest((check / item['file']).read_text(encoding='utf-8')) == item['afterSha256'], item['file']
    manifest['families'][base] = {'appliedAndCompared': True, 'checkDirectory': str(check), 'patches': [str(p.relative_to(OUT)) for p in patches], 'files': items}
(OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'output': str(OUT), 'files': sum(map(len, GROUPS.values())), 'runtimeFiles': len(RUNTIME), 'families': {name: value['appliedAndCompared'] for name, value in manifest['families'].items()}}, indent=2))
