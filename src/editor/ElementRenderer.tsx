import React from 'react';
import { CVElement } from '../types/document';
import { SectionSlot } from '../components/SectionSlot';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Award,
  CheckCircle,
  Star,
  Check,
  Briefcase,
  GraduationCap
} from 'lucide-react';

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
    borderStyle: style?.borderStyle || (style?.borderWidth ? 'solid' : undefined),
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
            contentEditable={true}
            suppressContentEditableWarning
            onBlur={(e) => onContentChange?.(e.currentTarget.innerText)}
            onInput={(e) => onContentChange?.(e.currentTarget.innerText)}
            className="outline-none min-h-[20px] w-full cursor-text"
            style={styleObj}
          >
            {typeof content === 'string' ? content : content?.text || 'Texte personnalisable'}
          </div>
        );

      case 'shape': {
        const shapeType = content?.shapeType || 'rectangle';
        const label = content?.label || '';

        if (shapeType === 'circle') {
          return (
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-bold text-center text-xs p-1"
              style={{
                backgroundColor: style?.backgroundColor || '#2563EB',
                color: style?.color || '#FFFFFF',
                border: style?.borderWidth ? `${style.borderWidth}px solid ${style?.borderColor || '#1D4ED8'}` : undefined
              }}
            >
              {label}
            </div>
          );
        }

        if (shapeType === 'badge') {
          return (
            <div
              className="w-full h-full rounded-full px-3 py-1 flex items-center justify-center font-bold text-xs shadow-xs"
              style={{
                backgroundColor: style?.backgroundColor || '#DBEAFE',
                color: style?.color || '#1E40AF',
                border: style?.borderWidth ? `${style.borderWidth}px solid ${style?.borderColor || '#93C5FD'}` : undefined
              }}
            >
              {label || 'Badge Pilule'}
            </div>
          );
        }

        if (shapeType === 'pillar') {
          return (
            <div
              className="w-full h-full rounded-md shadow-2xs"
              style={{
                backgroundColor: style?.backgroundColor || '#1E293B'
              }}
            />
          );
        }

        return (
          <div
            className="w-full h-full flex items-center justify-center p-2 text-xs font-semibold"
            style={{
              backgroundColor: style?.backgroundColor || '#E2E8F0',
              color: style?.color || '#0F172A',
              borderRadius: style?.borderRadius ? `${style.borderRadius}px` : '6px',
              border: style?.borderWidth ? `${style.borderWidth}px solid ${style?.borderColor || '#CBD5E1'}` : undefined
            }}
          >
            {label}
          </div>
        );
      }

      case 'list': {
        const bulletStyle = content?.bulletStyle || content?.type || 'disc';
        const rawItems = content?.items || [
          { id: '1', text: 'Premier point clé', level: 0 },
          { id: '2', text: 'Deuxième point fort', level: 0 },
          { id: '3', text: 'Troisième compétence', level: 0 }
        ];

        const items = rawItems.map((it: any, i: number) =>
          typeof it === 'string' ? { id: `item-${i}`, text: it, level: 0 } : { level: 0, ...it }
        );

        const getBulletPrefix = (style: string, level: number, idx: number) => {
          if (style === 'square') return '■';
          if (style === 'arrow') return '➢';
          if (style === 'check') return '✓';
          if (style === 'star') return '★';
          if (style === 'dash') return '-';
          if (style === 'numbered') return `${idx + 1}.`;
          return level > 0 ? '◦' : '•';
        };

        const updateItemText = (idx: number, newText: string) => {
          const updated = [...items];
          updated[idx] = { ...updated[idx], text: newText };
          onContentChange?.({ ...content, items: updated });
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, idx: number) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const updated = [...items];
            updated.splice(idx + 1, 0, { id: `item-${Date.now()}`, text: '', level: items[idx]?.level || 0 });
            onContentChange?.({ ...content, items: updated });
          } else if (e.key === 'Backspace' && items[idx].text === '' && items.length > 1) {
            e.preventDefault();
            const updated = items.filter((_, i) => i !== idx);
            onContentChange?.({ ...content, items: updated });
          } else if (e.key === 'Tab') {
            e.preventDefault();
            const updated = [...items];
            const currentLvl = updated[idx].level || 0;
            const newLvl = e.shiftKey ? Math.max(0, currentLvl - 1) : Math.min(2, currentLvl + 1);
            updated[idx] = { ...updated[idx], level: newLvl };
            onContentChange?.({ ...content, items: updated });
          }
        };

        return (
          <div className="w-full space-y-1.5" style={styleObj}>
            {content?.title && (
              <h4
                contentEditable={true}
                suppressContentEditableWarning
                onBlur={(e) => onContentChange?.({ ...content, title: e.currentTarget.innerText })}
                className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1 outline-none"
              >
                {content.title}
              </h4>
            )}

            <div className="space-y-1">
              {items.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="flex items-start space-x-2 text-xs"
                  style={{ paddingLeft: `${(item.level || 0) * 16}px` }}
                >
                  <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0 select-none">
                    {getBulletPrefix(bulletStyle, item.level || 0, idx)}
                  </span>
                  <div
                    contentEditable={true}
                    suppressContentEditableWarning
                    onBlur={(e) => updateItemText(idx, e.currentTarget.innerText)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="outline-none min-w-[20px] flex-1 cursor-text focus:bg-blue-50/50 dark:focus:bg-blue-950/50 rounded px-1"
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'two-column': {
        const leftPercent = content?.leftWidthPercent || 30;
        const rightPercent = content?.rightWidthPercent || 70;
        const gap = content?.gap || 16;

        return (
          <div className="w-full h-full flex rounded-xl border border-dashed border-blue-300 dark:border-blue-800 p-2 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
            <div
              className="p-3 rounded-lg flex flex-col space-y-2 border border-slate-200 dark:border-slate-800"
              style={{
                width: `${leftPercent}%`,
                marginRight: `${gap / 2}px`,
                backgroundColor: content?.leftColumnBackground || '#F8FAFC'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Colonne Gauche ({leftPercent}%)
              </span>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {content?.leftTitle || 'Photo, Contact, Compétences'}
              </div>
            </div>

            <div
              className="p-3 rounded-lg flex flex-col space-y-2 border border-slate-200 dark:border-slate-800"
              style={{
                width: `${rightPercent}%`,
                marginLeft: `${gap / 2}px`,
                backgroundColor: content?.rightColumnBackground || '#FFFFFF'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Colonne Droite ({rightPercent}%)
              </span>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {content?.rightTitle || 'Profil, Expériences, Formation'}
              </div>
            </div>
          </div>
        );
      }

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
              onUpdateSection={(updatedSec) => {
                onContentChange?.({
                  ...content,
                  section: updatedSec
                });
              }}
            />
          );
        }

        // Header Banner / Card
        const photoFormeClass =
          content?.photoForme === 'ronde' || !content?.photoForme
            ? 'rounded-full'
            : content?.photoForme === 'arrondie'
            ? 'rounded-xl'
            : content?.photoForme === 'galet'
            ? 'rounded-[35%_65%_70%_30%/30%_30%_70%_70%]'
            : content?.photoForme === 'arche'
            ? 'rounded-t-full rounded-b-lg'
            : content?.photoForme === 'hexagone'
            ? 'rounded-2xl rotate-3'
            : 'rounded-none';

        const photoSizePx = content?.photoTaille || 70;

        return (
          <div
            className="w-full flex items-center justify-between p-4 rounded-xl shadow-xs relative"
            style={{ backgroundColor: style?.backgroundColor || '#2563EB', color: style?.color || '#FFFFFF' }}
          >
            <div className="space-y-1 flex-1 pr-3">
              <h1
                contentEditable={true}
                suppressContentEditableWarning
                onBlur={(e) =>
                  onContentChange?.({ ...content, title: e.currentTarget.innerText })
                }
                className="text-xl font-black uppercase tracking-tight outline-none focus:bg-white/10 rounded px-1"
              >
                {content?.title || 'Votre Nom'}
              </h1>
              <p
                contentEditable={true}
                suppressContentEditableWarning
                onBlur={(e) =>
                  onContentChange?.({ ...content, subtitle: e.currentTarget.innerText })
                }
                className="text-xs font-bold uppercase tracking-wider opacity-90 outline-none focus:bg-white/10 rounded px-1"
              >
                {content?.subtitle || 'Titre Professionnel'}
              </p>
              <div className="flex flex-wrap gap-3 text-[10px] opacity-80 pt-1">
                {content?.email && <span>📧 {content.email}</span>}
                {content?.phone && <span>📞 {content.phone}</span>}
                {content?.location && <span>📍 {content.location}</span>}
                {content?.linkedin && <span>💼 {content.linkedin}</span>}
              </div>
            </div>
            {content?.showPhoto && content?.photoUrl && (
              <img
                src={content.photoUrl}
                alt="Profile"
                style={{ width: `${photoSizePx}px`, height: `${photoSizePx}px` }}
                className={`object-cover border-2 border-white/80 shadow-md shrink-0 ${photoFormeClass}`}
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
              <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs rounded-xl p-2 text-center">
                <span>Glisser/Déposer une image</span>
              </div>
            )}
          </div>
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

      case 'experience': {
        const title = content?.title || 'Expérience Professionnelle';
        const items = content?.items || [
          {
            poste: 'Développeur Fullstack',
            entreprise: 'Tech Corp',
            date: '2022 - Présent',
            description: 'Conception et réalisation d\'applications modernes.'
          }
        ];

        return (
          <div className="w-full space-y-2 p-1" style={styleObj}>
            <h3 className="font-bold text-sm text-blue-600 border-b border-blue-200 pb-1 flex items-center space-x-1.5">
              <Briefcase className="w-4 h-4" />
              <span>{title}</span>
            </h3>
            <div className="space-y-2">
              {items.map((it: any, idx: number) => (
                <div key={idx} className="space-y-0.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
                    <span>{it.poste}</span>
                    <span className="text-slate-500 font-normal">{it.date}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-semibold">{it.entreprise}</div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{it.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'education': {
        const title = content?.title || 'Formation';
        const items = content?.items || [
          {
            diplome: 'Master en Informatique',
            ecole: 'Université de Paris',
            date: '2019 - 2021'
          }
        ];

        return (
          <div className="w-full space-y-2 p-1" style={styleObj}>
            <h3 className="font-bold text-sm text-purple-600 border-b border-purple-200 pb-1 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>{title}</span>
            </h3>
            <div className="space-y-2">
              {items.map((it: any, idx: number) => (
                <div key={idx} className="space-y-0.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100">
                    <span>{it.diplome}</span>
                    <span className="text-slate-500 font-normal">{it.date}</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-semibold">{it.ecole}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

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
      className={`relative w-full h-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-50' : 'hover:outline-1 hover:outline-dashed hover:outline-blue-300'
      }`}
    >
      {renderContent()}
    </div>
  );
};
