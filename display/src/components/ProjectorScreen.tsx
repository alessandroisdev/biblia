import { useState, useEffect, useMemo } from 'react';

interface ProjectedContent {
  text: string;
  reference?: string; // Para versículos
  version?: string; // Para versículos
  isSong?: boolean; // Para identificar que é música e não Bíblia
}

interface Background {
  type: 'color' | 'image' | 'video';
  url?: string;
  color?: string;
}

interface Marquee {
  text: string;
  show: boolean;
}

export function ProjectorScreen() {
  const [content, setContent] = useState<ProjectedContent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [background, setBackground] = useState<Background>({ type: 'color', color: '#000000' });
  const [marquee, setMarquee] = useState<Marquee>({ text: '', show: false });

  const channel = useMemo(() => new BroadcastChannel('bible_projector'), []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      
      if (type === 'DISPLAY_VERSE' || type === 'DISPLAY_LYRICS') {
        setIsVisible(false);
        setTimeout(() => {
          setContent({
            ...payload,
            isSong: type === 'DISPLAY_LYRICS'
          });
          setIsVisible(true);
        }, 150);
      } else if (type === 'CLEAR_TEXT' || type === 'CLEAR_SCREEN') {
        setIsVisible(false);
        if (type === 'CLEAR_SCREEN') {
          setBackground({ type: 'color', color: '#000000' });
          setMarquee({ text: '', show: false });
        }
      } else if (type === 'SET_BACKGROUND') {
        setBackground(payload);
      } else if (type === 'SET_MARQUEE') {
        setMarquee(payload);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, [channel]);

  // Estilos do texto baseados se é música ou Bíblia
  const textClass = content?.isSong 
    ? "text-white text-[4.5vw] leading-[1.4] font-sans text-center font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
    : "text-white text-[5vw] leading-[1.3] font-serif text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]";

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center cursor-none relative"
         style={{ backgroundColor: background.type === 'color' ? background.color : '#000' }}>
      
      {/* Camada de Background (Imagem/Video) */}
      {background.type === 'image' && background.url && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url(${background.url})` }}
        />
      )}
      {background.type === 'video' && background.url && (
        <video 
          src={background.url}
          autoPlay 
          loop 
          muted 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Camada de Overlay Escuro para destacar o texto */}
      {(background.type === 'image' || background.type === 'video') && (
        <div className="absolute inset-0 bg-black/40 z-10" />
      )}

      {/* Camada de Texto Principal */}
      <div 
        className={`w-full max-w-[90vw] transition-opacity duration-500 flex flex-col items-center z-20 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {content && (
          <>
            <p 
              className={textClass}
              dangerouslySetInnerHTML={{ __html: content.text }}
            />
            
            {/* Referência Bíblica só aparece se não for música e tiver referência */}
            {!content.isSong && content.reference && (
              <div className="mt-8 flex items-center gap-4 text-[2vw] text-gray-200 font-sans tracking-wide drop-shadow-lg">
                <span className="font-bold">{content.reference}</span>
                {content.version && (
                  <>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="uppercase">{content.version}</span>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Camada de Aviso invisível (quando tudo está preto) */}
      {!isVisible && background.type === 'color' && background.color === '#000000' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-white/50 text-xl font-sans select-none z-0">
          Projector Ready
        </div>
      )}

      {/* Camada do Letreiro (Marquee) */}
      {marquee.show && marquee.text && (
        <div className="absolute bottom-0 w-full bg-primary/90 text-white py-3 z-50 overflow-hidden shadow-lg border-t-4 border-primary-dark">
          <div className="whitespace-nowrap inline-block animate-[marquee_20s_linear_infinite] text-[2.5vw] font-bold font-sans tracking-wide">
            {marquee.text}
            <span className="inline-block w-screen"></span>
            {marquee.text}
          </div>
        </div>
      )}
    </div>
  );
}
