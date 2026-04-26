import { useState, useEffect, useMemo } from 'react';

interface ProjectedVerse {
  text: string;
  reference: string;
  version: string;
}

export function ProjectorScreen() {
  const [verse, setVerse] = useState<ProjectedVerse | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const channel = useMemo(() => new BroadcastChannel('bible_projector'), []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      if (type === 'DISPLAY_VERSE') {
        // Fade out slightly before changing if already visible
        setIsVisible(false);
        setTimeout(() => {
          setVerse(payload);
          setIsVisible(true);
        }, 150);
      } else if (type === 'CLEAR_SCREEN') {
        setIsVisible(false);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, [channel]);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center p-12 cursor-none">
      <div 
        className={`w-full max-w-[90vw] transition-opacity duration-500 flex flex-col items-center ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {verse && (
          <>
            <p 
              className="text-white text-[5vw] leading-[1.3] font-serif text-center drop-shadow-2xl"
              dangerouslySetInnerHTML={{ __html: verse.text }}
            />
            
            <div className="mt-8 flex items-center gap-4 text-[2vw] text-gray-400 font-sans tracking-wide opacity-80">
              <span className="font-bold">{verse.reference}</span>
              <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
              <span className="uppercase">{verse.version}</span>
            </div>
          </>
        )}
      </div>
      
      {/* Aviso invisível caso a tela esteja preta */}
      {!isVisible && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-white/50 text-xl font-sans select-none">
          Projector Ready
        </div>
      )}
    </div>
  );
}
