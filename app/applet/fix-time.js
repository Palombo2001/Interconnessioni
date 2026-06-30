const fs = require('fs');
let code = fs.readFileSync('src/components/SynapticCanvas.tsx', 'utf8');
code = code.replace(/p\.frameCount/g, 'activeTime');
// Restore background stars to use p.frameCount so they still blink
code = code.replace(/activeTime \* 0\.02 \+ star\.y/g, 'p.frameCount * 0.02 + star.y');
fs.writeFileSync('src/components/SynapticCanvas.tsx', code);
