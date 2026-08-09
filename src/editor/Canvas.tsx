import React, { useState, useRef } from 'react';
import { CVDocument, CVPage, CVElement } from '../types/document';
import { ElementRenderer } from './ElementRenderer';
import { Plus, Trash2, FileText, Move } from 'lucide-react';

interface CanvasProps {
  document: CVDocument;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (element: CVElement) => void;
  onAddPage: () => void;
  onRemovePage: (pageId: string) => void;
  zoomLevel: number;
  gridSnap: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({
  document,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onAddPage,
  onRemovePage,
  zoomLevel,
  gridSnap
}) => {
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; elemX: number; elemY: number; elemW: number; elemH: number }>({
    x: 0,
    y: 0,
    elemX: 0,
    elemY: 0,
    elemW: 0,
    elemH: 0
  });

  const handleMouseDownElement = (e: React.MouseEvent, elem: CVElement) => {
    e.stopPropagation();
    onSelectElement(elem.id);

    if (elem.locked) return;

    setDraggingElementId(elem.id);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height || 40
    };
  };

  const handleMouseDownResizeHandle = (e: React.MouseEvent, handle: string, elem: CVElement) => {
    e.stopPropagation();
    setResizingHandle(handle);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height || 40
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElementId && !resizingHandle) return;

    // Find active element across pages
    let activePage: CVPage | undefined;
    let activeElem: CVElement | undefined;

    for (const p of document.pages) {
      const found = p.elements.find((el) => el.id === (draggingElementId || selectedElementId));
      if (found) {
        activePage = p;
        activeElem = found;
        break;
      }
    }

    if (!activeElem) return;

    const deltaX = (e.clientX - dragStartPos.current.x) / zoomLevel;
    const deltaY = (e.clientY - dragStartPos.current.y) / zoomLevel;

    const gridSize = gridSnap ? document.settings.gridSize || 10 : 1;

    const snap = (val: number) => Math.round(val / gridSize) * gridSize;

    if (draggingElementId) {
      const newX = Math.max(0, snap(dragStartPos.current.elemX + deltaX));
      const newY = Math.max(0, snap(dragStartPos.current.elemY + deltaY));

      onUpdateElement({
        ...activeElem,
        x: newX,
        y: newY
      });
    } else if (resizingHandle) {
      let newW = dragStartPos.current.elemW;
      let newH = dragStartPos.current.elemH;

      if (resizingHandle.includes('e')) {
        newW = Math.max(30, snap(dragStartPos.current.elemW + deltaX));
      }
      if (resizingHandle.includes('s')) {
        newH = Math.max(20, snap(dragStartPos.current.elemH + deltaY));
      }

      onUpdateElement({
        ...activeElem,
        width: newW,
        height: newH
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingElementId(null);
    setResizingHandle(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={() => onSelectElement(null)}
      className="flex-1 bg-slate-200/70 dark:bg-slate-950 p-8 overflow-auto flex flex-col items-center space-y-8 select-none"
    >
      {document.pages.map((page, pageIdx) => (
        <div
          key={page.id}
          className="relative bg-white dark:bg-slate-900 shadow-2xl transition-transform border border-slate-300 dark:border-slate-800 shrink-0"
          style={{
            width: `${page.width}px`,
            height: `${page.height}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            backgroundColor: page.background || '#FFFFFF'
          }}
        >
          {/* Page Badge Label */}
          <div className="absolute -top-6 left-0 text-[11px] font-black uppercase text-slate-400 tracking-wider">
            Page {pageIdx + 1} sur {document.pages.length}
          </div>

          {/* Grid Overlay if enabled */}
          {gridSnap && (
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
                backgroundSize: '10px 10px'
              }}
            />
          )}

          {/* Render Elements */}
          {page.elements.map((elem) => {
            const isSelected = selectedElementId === elem.id;

            return (
              <div
                key={elem.id}
                onMouseDown={(e) => handleMouseDownElement(e, elem)}
                style={{
                  position: 'absolute',
                  left: `${elem.x}px`,
                  top: `${elem.y}px`,
                  width: `${elem.width}px`,
                  height: elem.height ? `${elem.height}px` : 'auto',
                  zIndex: elem.zIndex || 10
                }}
                className={`group ${isSelected ? 'ring-2 ring-blue-600' : ''}`}
              >
                <ElementRenderer
                  element={elem}
                  isSelected={isSelected}
                  onSelect={(e) => {
                    e.stopPropagation();
                    onSelectElement(elem.id);
                  }}
                  onContentChange={(newText) => {
                    onUpdateElement({
                      ...elem,
                      content: typeof elem.content === 'string' ? newText : { ...elem.content, text: newText }
                    });
                  }}
                />

                {/* Resize Handles for Selected Element */}
                {isSelected && !elem.locked && (
                  <>
                    {/* Corner & Edge Handles */}
                    <div
                      onMouseDown={(e) => handleMouseDownResizeHandle(e, 'se', elem)}
                      className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full cursor-se-resize shadow-md z-50"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDownResizeHandle(e, 'e', elem)}
                      className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full cursor-e-resize shadow-md z-50"
                    />
                    <div
                      onMouseDown={(e) => handleMouseDownResizeHandle(e, 's', elem)}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full cursor-s-resize shadow-md z-50"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Page Actions */}
      <div className="flex items-center space-x-3 pt-4">
        <button
          onClick={onAddPage}
          className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer text-slate-800 dark:text-slate-200"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Ajouter une Page</span>
        </button>
        {document.pages.length > 1 && (
          <button
            onClick={() => onRemovePage(document.pages[document.pages.length - 1].id)}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-red-50 border border-red-200 dark:border-red-900/50 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-xs cursor-pointer text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer la dernière page</span>
          </button>
        )}
      </div>

    </div>
  );
};
