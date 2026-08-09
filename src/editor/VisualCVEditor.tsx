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
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [gridSnap, setGridSnap] = useState<boolean>(true);

  const [showAIModal, setShowAIModal] = useState(false);
  const [showATSModal, setShowATSModal] = useState(false);

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

  // Handle adding new element
  const handleAddElement = (type: ElementType, presetContent?: any) => {
    const newId = `elem-${type}-${Date.now()}`;
    const newElement: CVElement = {
      id: newId,
      type,
      x: 50,
      y: 120 + (document.pages[0]?.elements.length || 0) * 30,
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
      const firstPage = prevDoc.pages[0];
      const updatedFirstPage = {
        ...firstPage,
        elements: [...firstPage.elements, newElement]
      };
      return {
        ...prevDoc,
        pages: [updatedFirstPage, ...prevDoc.pages.slice(1)]
      };
    });

    setSelectedElementId(newId);
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
    const newPage = {
      id: `page-${newPageNum}`,
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
    <div className="flex flex-col h-screen w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      
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
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        {/* Left Elements Sidebar */}
        <ElementsSidebar onAddElement={handleAddElement} />

        {/* Center Canvas */}
        <Canvas
          document={document}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onUpdateElement={handleUpdateElement}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
          zoomLevel={zoomLevel}
          gridSnap={gridSnap}
        />

        {/* Right Properties Panel */}
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
