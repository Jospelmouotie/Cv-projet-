import React, { useState, useRef } from 'react';
import { CVDocument, CVPage, CVElement } from '../types/document';
import { Language } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { Plus, Trash2, RotateCw } from 'lucide-react';

interface CanvasProps {
  document: CVDocument;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (element: CVElement) => void;
  onAddPage: () => void;
  onRemovePage: (pageId: string) => void;
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  zoomLevel: number;
  gridSnap: boolean;
  lang?: Language;
}

export const Canvas: React.FC<CanvasProps> = ({
  document,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onAddPage,
  onRemovePage,
  activePageId,
  onSelectPage,
  zoomLevel,
  gridSnap,
  lang = 'fr'
}) => {
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});

  const dragStartPos = useRef<{
    x: number;
    y: number;
    elemX: number;
    elemY: number;
    elemW: number;
    elemH: number;
    rotation: number;
    centerX: number;
    centerY: number;
  }>({
    x: 0,
    y: 0,
    elemX: 0,
    elemY: 0,
    elemW: 0,
    elemH: 0,
    rotation: 0,
    centerX: 0,
    centerY: 0
  });

  const getActiveElement = (): { activePage?: CVPage; activeElem?: CVElement } => {
    for (const p of document.pages) {
      const found = p.elements.find((el) => el.id === (draggingElementId || selectedElementId));
      if (found) {
        return { activePage: p, activeElem: found };
      }
    }
    return {};
  };

  const handlePointerDownElement = (e: React.PointerEvent, elem: CVElement, pageId: string) => {
    e.stopPropagation();
    onSelectPage(pageId);
    onSelectElement(elem.id);

    if (elem.locked) return;

    const targetEl = e.target as HTMLElement;
    if (
      targetEl.isContentEditable ||
      targetEl.closest('[contenteditable="true"]') ||
      targetEl.tagName === 'INPUT' ||
      targetEl.tagName === 'TEXTAREA' ||
      targetEl.tagName === 'BUTTON'
    ) {
      return;
    }

    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch (_) {}
    setDraggingElementId(elem.id);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height || 40,
      rotation: elem.rotation || 0,
      centerX: elem.x + elem.width / 2,
      centerY: elem.y + (elem.height || 40) / 2
    };
  };

  const handlePointerDownResizeHandle = (e: React.PointerEvent, handle: string, elem: CVElement) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setResizingHandle(handle);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height || 40,
      rotation: elem.rotation || 0,
      centerX: elem.x + elem.width / 2,
      centerY: elem.y + (elem.height || 40) / 2
    };
  };

  const handlePointerDownRotateHandle = (e: React.PointerEvent, elem: CVElement) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsRotating(true);

    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elemX: elem.x,
      elemY: elem.y,
      elemW: elem.width,
      elemH: elem.height || 40,
      rotation: elem.rotation || 0,
      centerX,
      centerY
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingElementId && !resizingHandle && !isRotating) return;

    const { activeElem, activePage } = getActiveElement();
    if (!activeElem || !activePage) return;

    const gridSize = gridSnap ? document.settings.gridSize || 10 : 1;
    const snap = (val: number) => Math.round(val / gridSize) * gridSize;

    if (isRotating) {
      const radians = Math.atan2(e.clientY - dragStartPos.current.centerY, e.clientX - dragStartPos.current.centerX);
      let degrees = Math.round((radians * 180) / Math.PI) + 90;
      if (degrees < 0) degrees += 360;

      if (gridSnap) {
        degrees = Math.round(degrees / 15) * 15;
      }

      onUpdateElement({
        ...activeElem,
        rotation: degrees % 360
      });
      return;
    }

    const deltaX = (e.clientX - dragStartPos.current.x) / zoomLevel;
    const deltaY = (e.clientY - dragStartPos.current.y) / zoomLevel;

    if (draggingElementId) {
      const newX = Math.max(0, snap(dragStartPos.current.elemX + deltaX));
      const newY = Math.max(0, snap(dragStartPos.current.elemY + deltaY));

      const pageCenterX = activePage.width / 2;
      const pageCenterY = activePage.height / 2;
      const elemCenterX = newX + activeElem.width / 2;
      const elemCenterY = newY + (activeElem.height || 40) / 2;

      let guideX: number | undefined;
      let guideY: number | undefined;

      if (Math.abs(elemCenterX - pageCenterX) < 6) {
        guideX = pageCenterX;
      }
      if (Math.abs(elemCenterY - pageCenterY) < 6) {
        guideY = pageCenterY;
      }

      setGuides({ x: guideX, y: guideY });

      onUpdateElement({
        ...activeElem,
        x: guideX !== undefined ? pageCenterX - activeElem.width / 2 : newX,
        y: guideY !== undefined ? pageCenterY - (activeElem.height || 40) / 2 : newY
      });
    } else if (resizingHandle) {
      let newX = dragStartPos.current.elemX;
      let newY = dragStartPos.current.elemY;
      let newW = dragStartPos.current.elemW;
      let newH = dragStartPos.current.elemH;

      if (resizingHandle.includes('e')) {
        newW = Math.max(30, snap(dragStartPos.current.elemW + deltaX));
      }
      if (resizingHandle.includes('s')) {
        newH = Math.max(20, snap(dragStartPos.current.elemH + deltaY));
      }
      if (resizingHandle.includes('w')) {
        const possibleW = dragStartPos.current.elemW - deltaX;
        if (possibleW > 30) {
          newX = snap(dragStartPos.current.elemX + deltaX);
          newW = snap(possibleW);
        }
      }
      if (resizingHandle.includes('n')) {
        const possibleH = dragStartPos.current.elemH - deltaY;
        if (possibleH > 20) {
          newY = snap(dragStartPos.current.elemY + deltaY);
          newH = snap(possibleH);
        }
      }

      onUpdateElement({
        ...activeElem,
        x: newX,
        y: newY,
        width: newW,
        height: newH
      });
    }
  };

  const handlePointerUp = () => {
    setDraggingElementId(null);
    setResizingHandle(null);
    setIsRotating(false);
    setGuides({});
  };

  return (
    <div
      id="cv-preview-container"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectElement(null)}
      className="flex-1 bg-[#f5f5f5] dark:bg-[#0a0a0a] p-4 sm:p-8 overflow-auto flex flex-col items-center space-y-8 touch-pan-x touch-pan-y"
    >
      {document.pages.map((page, pageIdx) => {
        const isActivePage = page.id === activePageId;

        return (
          <div
            key={page.id}
            data-page-index={pageIdx + 1}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPage(page.id);
            }}
            className={`cv-page-sheet relative bg-white dark:bg-black shadow-xl transition-all border shrink-0 ${
              isActivePage 
                ? 'border-black/40 dark:border-white/40' 
                : 'border-black/10 dark:border-white/10'
            } ${pageIdx < document.pages.length - 1 ? 'page-break-after-always' : ''}`}
            style={{
              width: `${page.width}px`,
              height: `${page.height}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              backgroundColor: page.background || '#FFFFFF'
            }}
          >
            {/* Page Number - Minimal */}
            <div className="absolute -top-6 left-0 right-0 flex items-center justify-between px-0.5 print:hidden">
              <span className={`text-[9px] font-mono tracking-wider ${
                isActivePage ? 'text-black dark:text-white' : 'text-black/30 dark:text-white/30'
              }`}>
                {pageIdx + 1}/{document.pages.length}
              </span>
            </div>

            {/* Grid Overlay */}
            {gridSnap && (
              <div
                className="absolute inset-0 pointer-events-none opacity-10 print:hidden"
                style={{
                  backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)',
                  backgroundSize: '10px 10px'
                }}
              />
            )}

            {/* Alignment Guides */}
            {guides.x !== undefined && (
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-black/50 dark:border-white/50 z-50 pointer-events-none print:hidden"
                style={{ left: `${guides.x}px` }}
              />
            )}
            {guides.y !== undefined && (
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-black/50 dark:border-white/50 z-50 pointer-events-none print:hidden"
                style={{ top: `${guides.y}px` }}
              />
            )}

            {/* Render Elements */}
            {page.elements.map((elem) => {
              const isSelected = selectedElementId === elem.id;

              return (
                <div
                  key={elem.id}
                  onPointerDown={(e) => handlePointerDownElement(e, elem, page.id)}
                  style={{
                    position: 'absolute',
                    left: `${elem.x}px`,
                    top: `${elem.y}px`,
                    width: `${elem.width}px`,
                    height: elem.height ? `${elem.height}px` : 'auto',
                    transform: elem.rotation ? `rotate(${elem.rotation}deg)` : 'none',
                    zIndex: elem.zIndex || 10
                  }}
                  className={`group cursor-move ${
                    isSelected ? 'ring-2 ring-black/50 dark:ring-white/50' : ''
                  }`}
                >
                  <ElementRenderer
                    element={elem}
                    isSelected={isSelected}
                    onSelect={(e) => {
                      e.stopPropagation();
                      onSelectPage(page.id);
                      onSelectElement(elem.id);
                    }}
                    onContentChange={(newText) => {
                      onUpdateElement({
                        ...elem,
                        content: typeof elem.content === 'string' ? newText : { ...elem.content, text: newText }
                      });
                    }}
                  />

                  {/* Selection Handles */}
                  {isSelected && !elem.locked && (
                    <>
                      {/* Rotation Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDownRotateHandle(e, elem)}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-black dark:bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md z-50 border border-white/20 dark:border-black/20"
                      >
                        <RotateCw className="w-2.5 h-2.5 text-white dark:text-black" />
                      </div>

                      {/* Corner Handles */}
                      <div className="absolute -top-1 -left-1 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-nwse-resize shadow-md z-50" 
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'nw', elem)} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-nesw-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'ne', elem)} />
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-nesw-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'sw', elem)} />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-nwse-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'se', elem)} />

                      {/* Edge Handles */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-ns-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'n', elem)} />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-ns-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 's', elem)} />
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-ew-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'w', elem)} />
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-black dark:bg-white border border-white dark:border-black rounded-full cursor-ew-resize shadow-md z-50"
                        onPointerDown={(e) => handlePointerDownResizeHandle(e, 'e', elem)} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Page Controls - Minimal */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={onAddPage}
          className="px-3 py-1.5 bg-white dark:bg-black border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 text-black dark:text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Page</span>
        </button>
        {document.pages.length > 1 && (
          <button
            onClick={() => onRemovePage(document.pages[document.pages.length - 1].id)}
            className="px-3 py-1.5 bg-white dark:bg-black border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Page</span>
          </button>
        )}
      </div>
    </div>
  );
};