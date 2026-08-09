import React, { useState, useEffect } from 'react';
import { CV, Language } from '../types';
import { CVDocument, CVElement, ElementType } from '../types/document';
import { convertLegacyCVToDocument, convertDocumentToLegacyCV } from '../utils/documentConverter';
import { useHistory } from './useHistory';
import { Toolbar } from './Toolbar';
import { ElementsSidebar } from './ElementsSidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { AIAssistantModal } from './AIAssistantModal';
import { ATSAnalyzerModal } from './ATSAnalyzerModal';
import { exportCVToPDF } from '../utils/pdfExport';
import { PlusCircle, Sliders, Sparkles, FileSpreadsheet, X } from 'lucide-react';

interface VisualCVEditorProps {
  cv: CV;
  langue: Language;
  onSaveCV: (cv: CV) => Promise<void>;
  onToggleViewMode: (mode: 'visual' | 'form') => void;
  viewMode: 'visual' | 'form';
}

export const VisualCVEditor: React.FC<VisualCVEditorProps> = ({
  cv,
  langue,
  onSaveCV,
  onToggleViewMode,
  viewMode
}) => {
  const initialDoc = convertLegacyCVToDocument(cv);
  const {
    document,
    updateDocument,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory(initialDoc);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string>(document.pages[0]?.id || 'page-1');

  // Auto zoom adapting to mobile screen
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 0.45;
    }
    return 0.85;
  });
  const [gridSnap, setGridSnap] = useState<boolean>(true);

  // Mobile Bottom Sheet drawer state
  const [mobileDrawer, setMobileDrawer] = useState<'elements' | 'properties' | null>(null);

  const [showAIModal, setShowAIModal] = useState(false);
  const [showATSModal, setShowATSModal] = useState(false);

  // Keep activePageId valid if pages change
  useEffect(() => {
    if (!document.pages.some((p) => p.id === activePageId)) {
      setActivePageId(document.pages[0]?.id || 'page-1');
    }
  }, [document.pages]);

  // Find selected element object
  let selectedElement: CVElement | null = null;
  if (selectedElementId) {
    for (const p of document.pages) {
      const found = p.elements.find((el) => el.id === selectedElementId);
      if (found) {
        selectedElement = found;
        break;
      }
    }
  }

  // Handle element updates
  const handleUpdateElement = (updatedElement: CVElement) => {
    updateDocument((prevDoc) => {
      const updatedPages = prevDoc.pages.map((page) => ({
        ...page,
        elements: page.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el))
      }));
      return { ...prevDoc, pages: updatedPages };
    });
  };

  // Handle adding new element to active page
  const handleAddElement = (type: ElementType, presetContent?: any) => {
    const newId = `elem-${type}-${Date.now()}`;
    const targetPageIdx = document.pages.findIndex((p) => p.id === activePageId);
    const validIdx = targetPageIdx >= 0 ? targetPageIdx : 0;
    const targetPage = document.pages[validIdx];

    const newElement: CVElement = {
      id: newId,
      type,
      x: 50,
      y: 100 + (targetPage?.elements.length || 0) * 35,
      width: type === 'line' ? 680 : type === 'text' ? 400 : 250,
      height: type === 'shape' ? 80 : 40,
      zIndex: 30,
      locked: false,
      visible: true,
      style: {
        color: '#1E293B',
        backgroundColor: type === 'shape' ? '#E2E8F0' : 'transparent',
        fontSize: type === 'text' ? 14 : 10,
        fontFamily: 'Inter',
        padding: type === 'contact' ? 8 : 4
      },
      content: presetContent || { text: 'Nouveau contenu' }
    };

    updateDocument((prevDoc) => {
      const updatedPages = prevDoc.pages.map((p, idx) => {
        if (idx === validIdx) {
          return { ...p, elements: [...p.elements, newElement] };
        }
        return p;
      });
      return { ...prevDoc, pages: updatedPages };
    });

    setSelectedElementId(newId);
    setMobileDrawer(null); // Close mobile drawer after adding
  };

  // Handle duplicating element
  const handleDuplicateElement = (elementId: string) => {
    if (!selectedElement) return;

    const copyId = `elem-${selectedElement.type}-copy-${Date.now()}`;
    const copyElem: CVElement = {
      ...selectedElement,
      id: copyId,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      zIndex: (selectedElement.zIndex || 10) + 1
    };

    updateDocument((prevDoc) => {
      const updatedPages = prevDoc.pages.map((p) => {
        if (p.elements.some((el) => el.id === elementId)) {
          return { ...p, elements: [...p.elements, copyElem] };
        }
        return p;
      });
      return { ...prevDoc, pages: updatedPages };
    });

    setSelectedElementId(copyId);
  };

  // Handle deleting element
  const handleDeleteElement = (elementId: string) => {
    updateDocument((prevDoc) => {
      const updatedPages = prevDoc.pages.map((p) => ({
        ...p,
        elements: p.elements.filter((el) => el.id !== elementId)
      }));
      return { ...prevDoc, pages: updatedPages };
    });
    setSelectedElementId(null);
  };

  // Handle quick alignment
  const handleAlignElement = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (!selectedElement) return;

    const pageWidth = document.pages[0]?.width || 794;
    const pageHeight = document.pages[0]?.height || 1123;

    let newX = selectedElement.x;
    let newY = selectedElement.y;

    if (alignment === 'left') newX = 24;
    if (alignment === 'center') newX = Math.round((pageWidth - selectedElement.width) / 2);
    if (alignment === 'right') newX = pageWidth - selectedElement.width - 24;
    if (alignment === 'top') newY = 24;
    if (alignment === 'middle') newY = Math.round((pageHeight - (selectedElement.height || 40)) / 2);
    if (alignment === 'bottom') newY = pageHeight - (selectedElement.height || 40) - 24;

    handleUpdateElement({
      ...selectedElement,
      x: newX,
      y: newY
    });
  };

  // Handle adding new page
  const handleAddPage = () => {
    const newPageNum = document.pages.length + 1;
    const newPageId = `page-${Date.now()}`;
    const newPage = {
      id: newPageId,
      pageNumber: newPageNum,
      width: 794,
      height: 1123,
      margins: { top: 24, right: 24, bottom: 24, left: 24 },
      background: '#FFFFFF',
      elements: []
    };

    updateDocument((prevDoc) => ({
      ...prevDoc,
      pages: [...prevDoc.pages, newPage]
    }));

    setActivePageId(newPageId);
  };

  // Handle removing page
  const handleRemovePage = (pageId: string) => {
    if (document.pages.length <= 1) return;
    updateDocument((prevDoc) => ({
      ...prevDoc,
      pages: prevDoc.pages.filter((p) => p.id !== pageId)
    }));
  };

  // Sync document changes back to legacy CV object for persistence
  useEffect(() => {
    const syncTimeout = setTimeout(() => {
      const updatedLegacyCV = convertDocumentToLegacyCV(document);
      onSaveCV(updatedLegacyCV);
    }, 1200);

    return () => clearTimeout(syncTimeout);
  }, [document]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
      
      {/* Top Toolbar */}
      <Toolbar
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        gridSnap={gridSnap}
        onToggleGridSnap={() => setGridSnap(!gridSnap)}
        onOpenAIAssistant={() => setShowAIModal(true)}
        onOpenATSAnalyzer={() => setShowATSModal(true)}
        onSaveCV={() => onSaveCV(convertDocumentToLegacyCV(document))}
        onExportPDF={() => exportCVToPDF('cv-preview-container', `${cv.titreCV || cv.titre || 'CV'}.pdf`)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden relative">
        {/* Desktop Left Elements Sidebar */}
        <div className="hidden lg:block shrink-0 h-full">
          <ElementsSidebar onAddElement={handleAddElement} />
        </div>

        {/* Center Canvas */}
        <Canvas
          document={document}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
          activePageId={activePageId}
          onSelectPage={setActivePageId}
          zoomLevel={zoomLevel}
          gridSnap={gridSnap}
        />

        {/* Desktop Right Properties Panel */}
        <div className="hidden lg:block shrink-0 h-full">
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDuplicateElement={handleDuplicateElement}
            onDeleteElement={handleDeleteElement}
            onAlignElement={handleAlignElement}
            pageWidth={document.pages[0]?.width || 794}
            pageHeight={document.pages[0]?.height || 1123}
          />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (< lg screens) */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-around z-40 shrink-0 shadow-lg">
        <button
          onClick={() => setMobileDrawer(mobileDrawer === 'elements' ? null : 'elements')}
          className={`flex flex-col items-center space-y-1 text-[11px] font-bold p-1 rounded-xl transition-colors cursor-pointer ${
            mobileDrawer === 'elements' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>+ Éléments</span>
        </button>

        <button
          onClick={() => setMobileDrawer(mobileDrawer === 'properties' ? null : 'properties')}
          className={`flex flex-col items-center space-y-1 text-[11px] font-bold p-1 rounded-xl transition-colors cursor-pointer ${
            mobileDrawer === 'properties' ? 'text-blue-600' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span>Propriétés</span>
        </button>

        <button
          onClick={() => setShowAIModal(true)}
          className="flex flex-col items-center space-y-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 p-1 rounded-xl cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>IA Gemini</span>
        </button>

        <button
          onClick={() => setShowATSModal(true)}
          className="flex flex-col items-center space-y-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 p-1 rounded-xl cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Score ATS</span>
        </button>
      </div>

      {/* Mobile Bottom Drawer for Elements */}
      {mobileDrawer === 'elements' && (
        <div className="lg:hidden fixed inset-x-0 bottom-12 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-3xl max-h-[60vh] overflow-y-auto p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
            <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
              Ajouter des éléments au CV
            </span>
            <button
              onClick={() => setMobileDrawer(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ElementsSidebar onAddElement={handleAddElement} />
        </div>
      )}

      {/* Mobile Bottom Drawer for Properties */}
      {mobileDrawer === 'properties' && (
        <div className="lg:hidden fixed inset-x-0 bottom-12 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl rounded-t-3xl max-h-[65vh] overflow-y-auto p-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
            <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">
              Propriétés de l'élément sélectionné
            </span>
            <button
              onClick={() => setMobileDrawer(null)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onDuplicateElement={handleDuplicateElement}
            onDeleteElement={handleDeleteElement}
            onAlignElement={handleAlignElement}
            pageWidth={document.pages[0]?.width || 794}
            pageHeight={document.pages[0]?.height || 1123}
          />
        </div>
      )}

      {/* Modals */}
      {showAIModal && (
        <AIAssistantModal
          langue={langue}
          onClose={() => setShowAIModal(false)}
          onApplyText={(enhancedText) => {
            if (selectedElement) {
              handleUpdateElement({
                ...selectedElement,
                content: typeof selectedElement.content === 'string' ? enhancedText : { ...selectedElement.content, text: enhancedText }
              });
            }
          }}
        />
      )}

      {showATSModal && (
        <ATSAnalyzerModal
          document={document}
          onClose={() => setShowATSModal(false)}
        />
      )}

    </div>
  );
};
