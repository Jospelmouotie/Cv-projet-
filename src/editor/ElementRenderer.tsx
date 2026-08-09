import React from 'react';
import { CVElement } from '../types/document';
import { SectionSlot } from '../components/SectionSlot';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, CheckCircle, Star } from 'lucide-react';

interface ElementRendererProps {
  element: CVElement;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onContentChange?: (newContent: any) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onContentChange
}) => {
  const { type, style, content } = element;

  const styleObj: React.CSSProperties = {
    color: style?.color || 'inherit',
    backgroundColor: style?.backgroundColor || 'transparent',
    borderColor: style?.borderColor || 'transparent',
    borderWidth: style?.borderWidth ? `${style.borderWidth}px` : undefined,
    borderStyle: style?.borderWidth ? 'solid' : undefined,
    borderRadius: style?.borderRadius ? `${style.borderRadius}px` : undefined,
    fontSize: style?.fontSize ? `${style.fontSize}pt` : undefined,
    fontFamily: style?.fontFamily || 'inherit',
    fontWeight: style?.fontWeight || 'normal',
    fontStyle: style?.fontStyle || 'normal',
    textDecoration: style?.textDecoration || 'none',
    textAlign: style?.textAlign || 'left',
    lineHeight: style?.lineHeight || 1.4,
    letterSpacing: style?.letterSpacing ? `${style.letterSpacing}px` : undefined,
    textTransform: style?.textTransform || 'none',
    opacity: element.opacity !== undefined ? element.opacity : 1,
    padding: style?.padding ? `${style.padding}px` : undefined,
    margin: style?.margin ? `${style.margin}px` : undefined,
    boxShadow: style?.shadow && style.shadow !== 'none' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : undefined
  };

  const renderContent = () => {
    switch (type) {
      case 'text':
        return (
          <div
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => onContentChange?.(e.currentTarget.innerText)}
            className="outline-none min-h-[20px] w-full"
            style={styleObj}
          >
            {typeof content === 'string' ? content : content?.text || 'Texte personnalisable'}
          </div>
        );

      case 'section':
        if (content?.section) {
          return (
            <SectionSlot
              section={content.section}
              isSidebar={element.metadata?.column === 'gauche'}
              accentColor={content.accentColor || '#2563EB'}
              secondaryAccentColor={content.secondaryAccentColor || '#93C5FD'}
              textColor={style?.color || '#1E293B'}
              headingColor={content.accentColor || '#1E293B'}
              headerStyle={content.headerStyle || 'underline'}
              skillsDisplayMode={content.skillsDisplayMode || 'badges'}
              experienceDatesAlignment="top"
              bulletStyle="disc"
              titleFontSizePt={style?.fontSize || 11}
              fontCss={style?.fontFamily || 'Inter'}
              dynamicTextStyle={{ fontSize: style?.fontSize ? `${style.fontSize}pt` : '10pt' }}
              isReorderActive={false}
            />
          );
        }

        // Header Banner / Card
        return (
          <div
            className="w-full flex items-center justify-between p-4 rounded-xl shadow-xs"
            style={{ backgroundColor: style?.backgroundColor || '#2563EB', color: '#FFFFFF' }}
          >
            <div className="space-y-1">
              <h1 className="text-xl font-black uppercase tracking-tight">{content?.title || 'Votre Nom'}</h1>
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">{content?.subtitle || 'Titre Professionnel'}</p>
              <div className="flex flex-wrap gap-3 text-[10px] opacity-80 pt-1">
                {content?.email && <span>📧 {content.email}</span>}
                {content?.phone && <span>📞 {content.phone}</span>}
                {content?.location && <span>📍 {content.location}</span>}
              </div>
            </div>
            {content?.showPhoto && content?.photoUrl && (
              <img
                src={content.photoUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0"
              />
            )}
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full overflow-hidden flex items-center justify-center">
            {content?.src ? (
              <img
                src={content.src}
                alt={content.alt || 'Visual'}
                className="w-full h-full object-cover"
                style={{ borderRadius: style?.borderRadius ? `${style.borderRadius}px` : undefined }}
              />
            ) : (
              <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs rounded-xl">
                <span>Cliquez pour ajouter une image</span>
              </div>
            )}
          </div>
        );

      case 'shape':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: style?.backgroundColor || '#3B82F6',
              borderRadius: style?.borderRadius ? `${style.borderRadius}px` : '4px',
              border: style?.borderWidth ? `${style.borderWidth}px solid ${style?.borderColor || '#1D4ED8'}` : undefined
            }}
          />
        );

      case 'line':
        return (
          <div
            className="w-full my-auto"
            style={{
              height: `${style?.borderWidth || 2}px`,
              backgroundColor: style?.color || style?.backgroundColor || '#CBD5E1',
              borderRadius: '2px'
            }}
          />
        );

      case 'contact':
        return (
          <div
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs"
            style={{ backgroundColor: style?.backgroundColor || '#F1F5F9', color: style?.color || '#0F172A' }}
          >
            <Mail className="w-3.5 h-3.5 opacity-80" />
            <span>{typeof content === 'string' ? content : content?.value || 'contact@email.com'}</span>
          </div>
        );

      case 'icon':
        return (
          <div className="flex items-center justify-center p-1" style={{ color: style?.color || '#2563EB' }}>
            <Star className="w-full h-full max-w-[48px] max-h-[48px]" />
          </div>
        );

      default:
        return (
          <div className="p-2 text-xs border border-slate-200 rounded" style={styleObj}>
            {typeof content === 'string' ? content : JSON.stringify(content)}
          </div>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`relative w-full h-full cursor-pointer select-none transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-50' : 'hover:outline-1 hover:outline-dashed hover:outline-blue-300'
      }`}
    >
      {renderContent()}
    </div>
  );
};
