'use client'

import { useEffect } from 'react'

export function FontLoader() {
  useEffect(() => {
    // #region agent log
    // Check if Material Symbols font is loaded
    const checkFontLoading = () => {
      if ('fonts' in document) {
        // Check if font is available (check() returns boolean, not Promise)
        const isLoaded = document.fonts.check('1em "Material Symbols Outlined"');
        fetch('http://127.0.0.1:7243/ingest/2cc1acae-5f16-4bda-901f-ffdd990c9b0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FontLoader.tsx:checkFontLoading',message:'Font availability check',data:{isLoaded,allFonts:Array.from(document.fonts).map(f=>`${f.family} ${f.status}`)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        
        document.fonts.ready.then(() => {
          const materialSymbolsLoaded = Array.from(document.fonts).some(font => 
            font.family.includes('Material Symbols') && font.status === 'loaded'
          );
          fetch('http://127.0.0.1:7243/ingest/2cc1acae-5f16-4bda-901f-ffdd990c9b0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FontLoader.tsx:fonts.ready',message:'Font loading status',data:{materialSymbolsLoaded,loadedFonts:Array.from(document.fonts).filter(f=>f.status==='loaded').map(f=>f.family),pendingFonts:Array.from(document.fonts).filter(f=>f.status==='loading').map(f=>f.family)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        });
      }
      
      // Check stylesheets
      const sheets = Array.from(document.styleSheets);
      const materialSymbolsSheet = sheets.find(sheet => {
        try {
          return sheet.href?.includes('fonts.googleapis.com') || sheet.href?.includes('Material');
        } catch {
          return false;
        }
      });
      
      fetch('http://127.0.0.1:7243/ingest/2cc1acae-5f16-4bda-901f-ffdd990c9b0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FontLoader.tsx:useEffect',message:'Stylesheet check',data:{hasMaterialSymbolsSheet:!!materialSymbolsSheet,materialSymbolsHref:materialSymbolsSheet?.href,totalSheets:sheets.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    };
    
    // Check immediately and after delay
    checkFontLoading();
    setTimeout(checkFontLoading, 500);
    setTimeout(checkFontLoading, 2000);
    // #endregion agent log
    
    // Ensure font is loaded by creating a link element if needed
    if (typeof document !== 'undefined') {
      const existingLink = document.querySelector('link[href*="Material+Symbols"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
        document.head.appendChild(link);
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/2cc1acae-5f16-4bda-901f-ffdd990c9b0e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FontLoader.tsx:useEffect',message:'Added Material Symbols link tag',data:{linkAdded:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion agent log
      }
    }
  }, [])

  return null
}

