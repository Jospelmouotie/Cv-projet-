import { useState, useCallback, useEffect } from 'react';
import { CVDocument } from '../types/document';

export function useHistory(initialDocument: CVDocument) {
  const [past, setPast] = useState<CVDocument[]>([]);
  const [present, setPresent] = useState<CVDocument>(initialDocument);
  const [future, setFuture] = useState<CVDocument[]>([]);

  // Update present state while preserving undo history
  const updateDocument = useCallback((newDoc: CVDocument | ((prev: CVDocument) => CVDocument)) => {
    setPresent((prevPresent) => {
      const nextDoc = typeof newDoc === 'function' ? newDoc(prevPresent) : newDoc;
      if (JSON.stringify(prevPresent) === JSON.stringify(nextDoc)) {
        return prevPresent;
      }
      setPast((prevPast) => [...prevPast, prevPresent]);
      setFuture([]);
      return nextDoc;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);
      setFuture((prevFuture) => [present, ...prevFuture]);
      setPresent(previous);
      return newPast;
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);
      setPast((prevPast) => [...prevPast, present]);
      setPresent(next);
      return newFuture;
    });
  }, [present]);

  // Sync present if external document changes drastically (e.g. template reload)
  const resetDocument = useCallback((doc: CVDocument) => {
    setPast([]);
    setPresent(doc);
    setFuture([]);
  }, []);

  // Keyboard Shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    document: present,
    updateDocument,
    resetDocument,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    pastCount: past.length,
    futureCount: future.length
  };
}
