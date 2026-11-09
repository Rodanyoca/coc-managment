import difflib
import hashlib
import json
import subprocess
from pathlib import Path

root = Path.cwd()
checkout = root / '.cache/cpu-publication/checkout'
out = root / 'docs/implementation/audit-cpu-publication-2026-10-22'
out.mkdir(exist_ok=True, parents=True)
base = 'c1488d33b6fcd2953d2bf0becc25a83055e13e2f'
files = ['lib/documents/data.ts', 'lib/google/sheets.ts']
patch = []
for file in files:
    current = (checkout / file).read_text(encoding='utf-8')
    old = subprocess.check_output(['git', 'show', f'{base}:{file}'], cwd=root).decode('utf-8').replace('\r\n', '\n')
    patch.extend(difflib.unified_diff(current.splitlines(keepends=True), old.splitlines(keepends=True), fromfile=f'a/{file}', tofile=f'b/{file}'))
target = out / 'rollback-D1-C1-conserve-S1.patch'
target.write_text(''.join('\n' if line == ' \n' else line for line in patch), encoding='utf-8', newline='\n')
subprocess.run(['git', 'apply', '--check', str(target)], cwd=checkout, check=True)
security = ['lib/auth.ts', 'lib/auth/authorization.ts', 'lib/auth/post-login-route.ts']
proof = {'baseBeforePerformanceLots': base, 'filesReverted': files, 's1FilesExcludedFromPatch': security, 's1Sha256': {file: hashlib.sha256((checkout/file).read_bytes()).hexdigest() for file in security}, 'applyCheck': 'passed; patch not applied to release checkout', 'deployed': False, 'limit': 'Before executing rollback, rebuild and rerun authorization and functional checks. CPU tests asserting optimized call counts intentionally describe the D1/C1 variant and need baseline expectations on a reverted version.'}
(out/'preuves/rollback.json').write_text(json.dumps(proof, indent=2)+'\n', encoding='utf-8')
print(json.dumps(proof, indent=2))
