import fs from 'fs';
import path from 'path';

try {
  // Only execute on Linux build environments (e.g. Render)
  if (process.platform !== 'win32') {
    const binDir = path.dirname(process.execPath);
    const npmPath = path.join(binDir, 'npm');
    const npmRealPath = path.join(binDir, 'npm-real');

    if (fs.existsSync(npmPath) && !fs.existsSync(npmRealPath)) {
      fs.copyFileSync(npmPath, npmRealPath);
      fs.chmodSync(npmRealPath, 0o755);

      const wrapperScript = `#!/bin/sh
if [ "$1" = "star" ]; then
  echo "🚀 [FoodieHub] Detected 'npm star' - launching server directly..."
  exec node backend/src/server.js
fi
exec "${npmRealPath}" "$@"
`;
      fs.writeFileSync(npmPath, wrapperScript, { mode: 0o755 });
      console.log('✅ Successfully configured npm start auto-recovery on Render!');
    }
  }
} catch (err) {
  console.warn('⚠️ Notice during auto-recovery setup:', err.message);
}