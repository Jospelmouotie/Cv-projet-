import React, { useState } from 'react';
import { CV } from '../types';
import { processUploadedImage } from '../utils/imageUpload';
import {
  User,
  X,
  Upload,
  Trash2,
  Check,
  Crop,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Globe,
  Briefcase,
  Layers,
  Sparkles,
  Palette,
  Sliders,
  Move,
  Camera
} from 'lucide-react';

interface HeaderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CV;
  onUpdateCV: (updatedCV: Partial<CV>) => void;
}

export const HeaderProfileModal: React.FC<HeaderProfileModalProps> = ({
  isOpen,
  onClose,
  cv,
  onUpdateCV
}) => {
  if (!isOpen) return null;

  const profilSec = cv.sections.find((s) => s.type === 'profil');
  const profilStyle = profilSec?.styleSection;

  const [nom, setNom] = useState(cv.nom || '');
  const [prenom, setPrenom] = useState(cv.prenom || '');
  const [titrePoste, setTitrePoste] = useState(cv.titrePoste || cv.titreCV || '');
  const [email, setEmail] = useState(cv.email || '');
  const [telephone, setTelephone] = useState(cv.telephone || '');
  const [adresse, setAdresse] = useState(cv.adresse || '');
  const [permis, setPermis] = useState(cv.permis || '');
  const [linkedin, setLinkedin] = useState(cv.linkedin || '');
  const [siteWeb, setSiteWeb] = useState(cv.siteWeb || '');

  const [couleurFondProfil, setCouleurFondProfil] = useState<string>(
    cv.couleurFondProfil || profilStyle?.couleurFond || ''
  );
  const [couleurTexteProfil, setCouleurTexteProfil] = useState<string>(
    cv.couleurTexteProfil || profilStyle?.couleurTexte || '#FFFFFF'
  );
  const [couleurSousTitrePrincipal, setCouleurSousTitrePrincipal] = useState<string>(
    cv.couleurSousTitrePrincipal || ''
  );

  const [afficherPhoto, setAfficherPhoto] = useState(cv.afficherPhoto !== false && Boolean(cv.photoUrl));
  const [photoUrl, setPhotoUrl] = useState(cv.photoUrl || '');
  const [photoForme, setPhotoForme] = useState<'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche' | 'galet'>(
    cv.photoForme || 'ronde'
  );
  const [photoTaille, setPhotoTaille] = useState(cv.photoTaille || 110);
  const [photoPosition, setPhotoPosition] = useState<'in-header' | 'in-sidebar' | 'free'>(
    cv.photoPosition || 'in-header'
  );
  const [photoX, setPhotoX] = useState<number>(cv.photoX ?? 10);
  const [photoY, setPhotoY] = useState<number>(cv.photoY ?? 5);

  const [grandTitreMode, setGrandTitreMode] = useState<'nom' | 'poste' | 'custom'>(
    cv.grandTitreMode || 'nom'
  );
  const [grandTitreTexte, setGrandTitreTexte] = useState<string>(
    cv.grandTitreTexte || ''
  );
  const [sectionProfilTitre, setSectionProfilTitre] = useState<string>(
    profilSec?.titre || 'PROFIL'
  );
  const [hauteurEnTetePx, setHauteurEnTetePx] = useState<number>(cv.hauteurEnTetePx || 80);
  const [photoBordureCouleur, setPhotoBordureCouleur] = useState<string>(cv.photoBordureCouleur || '#2563EB');
  const [photoBordureEpaisseur, setPhotoBordureEpaisseur] = useState<number>(cv.photoBordureEpaisseur ?? 2);
  const [cadrePhotoRing, setCadrePhotoRing] = useState<'none' | 'double-ring' | 'gold-ring' | 'accent-ring'>(cv.cadrePhotoRing || 'none');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processUploadedImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.9 });
      setPhotoUrl(dataUrl);
      setAfficherPhoto(true);
    } catch (err) {
      console.error('Error processing photo upload:', err);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setAfficherPhoto(false);
  };

  const handleSave = () => {
    const fullName = `${prenom} ${nom}`.trim();
    const updatedSections = (cv.sections || []).map((sec) => {
      if (sec.type === 'profil') {
        const pContenu = (sec.contenu || {}) as any;
        return {
          ...sec,
          titre: sectionProfilTitre || sec.titre || 'PROFIL',
          contenu: {
            ...pContenu,
            nomComplet: fullName || pContenu.nomComplet,
            titreProfessionnel: titrePoste || pContenu.titreProfessionnel,
            email: email || pContenu.email,
            telephone: telephone || pContenu.telephone,
            adresse: adresse || pContenu.adresse,
            linkedin: linkedin || pContenu.linkedin,
            siteWeb: siteWeb || pContenu.siteWeb || pContenu.website
          },
          styleSection: {
            ...(sec.styleSection || {}),
            couleurFond: couleurFondProfil || undefined,
            couleurTexte: couleurTexteProfil || undefined
          }
        };
      }
      return sec;
    });

    onUpdateCV({
      nom,
      prenom,
      titrePoste,
      titreCV: titrePoste,
      email,
      telephone,
      adresse,
      permis,
      linkedin,
      siteWeb,
      couleurFondProfil: couleurFondProfil || undefined,
      couleurTexteProfil: couleurTexteProfil || undefined,
      couleurSousTitrePrincipal: couleurSousTitrePrincipal || undefined,
      afficherPhoto,
      photoUrl,
      photoForme,
      photoTaille,
      photoPosition,
      photoX,
      photoY,
      photoBordureCouleur,
      photoBordureEpaisseur,
      cadrePhotoRing,
      grandTitreMode,
      grandTitreTexte,
      hauteurEnTetePx,
      sections: updatedSections
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-800 text-white flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Édition des Informations d'En-tête & Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-xs">
          
          {/* SECTION 1: IDENTITÉ PRINCIPALE */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Identité du Candidat</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Prénom</label>
                <input
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Nom de famille</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">Titre du Poste / En-tête professionnel</label>
              <input
                type="text"
                value={titrePoste}
                onChange={(e) => setTitrePoste(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Développeur Full-Stack Senior & Lead Tech"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block font-bold mb-1">Titre de la section Profil</label>
                <input
                  type="text"
                  value={sectionProfilTitre}
                  onChange={(e) => setSectionProfilTitre(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none"
                  placeholder="PROFIL"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Affichage du Grand Titre Principal</label>
                <select
                  value={grandTitreMode}
                  onChange={(e) => setGrandTitreMode(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="nom">Prénom & Nom (Par défaut)</option>
                  <option value="poste">Intitulé de poste en grand</option>
                  <option value="custom">Titre Personnalisé (Saisie libre)</option>
                </select>
              </div>
            </div>

            {grandTitreMode === 'custom' && (
              <div>
                <label className="block font-bold mb-1 text-blue-600 dark:text-blue-400">Texte du Grand Titre Personnalisé :</label>
                <input
                  type="text"
                  value={grandTitreTexte}
                  onChange={(e) => setGrandTitreTexte(e.target.value)}
                  className="w-full p-2 rounded-lg border-2 border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 text-xs font-bold outline-none"
                  placeholder="ex: CONSULTANT SENIOR & EXECUTIVE COACH"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: COULEUR DE FOND & PERSONNALISATION DU PROFIL */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Palette className="w-4 h-4" />
              <span>Couleur de Fond & Style de la Section Profil</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Couleur de fond du Profil</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={couleurFondProfil || cv.couleurAccent || '#2563EB'}
                    onChange={(e) => setCouleurFondProfil(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={couleurFondProfil}
                    onChange={(e) => setCouleurFondProfil(e.target.value)}
                    placeholder="Par défaut (Accent)"
                    className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                  {couleurFondProfil && (
                    <button
                      type="button"
                      onClick={() => setCouleurFondProfil('')}
                      className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer"
                      title="Réinitialiser"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Couleur du texte du Profil (Nom / Titres)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={couleurTexteProfil || '#FFFFFF'}
                    onChange={(e) => setCouleurTexteProfil(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={couleurTexteProfil}
                    onChange={(e) => setCouleurTexteProfil(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Couleur du Sous-titre / Intitulé de poste</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={couleurSousTitrePrincipal || cv.couleurAccent || '#2563EB'}
                    onChange={(e) => setCouleurSousTitrePrincipal(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    value={couleurSousTitrePrincipal}
                    onChange={(e) => setCouleurSousTitrePrincipal(e.target.value)}
                    placeholder="Automatique (Contraste intelligent)"
                    className="flex-1 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                  {couleurSousTitrePrincipal && (
                    <button
                      type="button"
                      onClick={() => setCouleurSousTitrePrincipal('')}
                      className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-red-500 border border-slate-200 dark:border-slate-700 rounded-md cursor-pointer"
                      title="Réinitialiser en mode automatique"
                    >
                      Auto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick preset color swatches for header background */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Palettes rapides de fond :</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Bleu Royal', color: '#1E40AF' },
                  { name: 'Bleu Nuit', color: '#0F172A' },
                  { name: 'Cyan Sombre', color: '#0E7490' },
                  { name: 'Émeraude', color: '#047857' },
                  { name: 'Pourpre', color: '#581C87' },
                  { name: 'Bordeaux', color: '#881337' },
                  { name: 'Charbon', color: '#18181B' },
                  { name: 'Blanc Pur', color: '#FFFFFF' },
                  { name: 'Gris Perle', color: '#F1F5F9' },
                ].map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => {
                      setCouleurFondProfil(swatch.color);
                      if (swatch.color === '#FFFFFF' || swatch.color === '#F1F5F9') {
                        setCouleurTexteProfil('#0F172A');
                      } else {
                        setCouleurTexteProfil('#FFFFFF');
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[10px] font-bold hover:scale-105 transition-transform cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: swatch.color }} />
                    <span>{swatch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: GESTION & FORME DE LA PHOTO */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Crop className="w-4 h-4" />
                <span>Photo de Profil & Style de Découpe</span>
              </h4>
              <label className="flex items-center space-x-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={afficherPhoto}
                  onChange={(e) => setAfficherPhoto(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>Afficher la photo</span>
              </label>
            </div>

            {afficherPhoto && (
              <div className="space-y-4 pt-1">
                {/* Photo Upload or Preview */}
                <div className="flex items-center space-x-4">
                  {photoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={photoUrl}
                        alt="Profil"
                        style={{
                          width: `${Math.min(90, photoTaille)}px`,
                          height: `${Math.min(90, photoTaille)}px`
                        }}
                        className={`object-cover border-2 border-blue-500 shadow-md ${
                          photoForme === 'ronde'
                            ? 'rounded-full'
                            : photoForme === 'arrondie'
                            ? 'rounded-xl'
                            : photoForme === 'galet'
                            ? 'rounded-[35%_65%_70%_30%/30%_30%_70%_70%]'
                            : photoForme === 'arche'
                            ? 'rounded-t-full rounded-b-lg'
                            : photoForme === 'hexagone'
                            ? 'rounded-2xl rotate-3'
                            : 'rounded-none'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0 border-2 border-dashed border-slate-300">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer flex items-center space-x-1 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Changer la photo</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Retirer la photo</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Formats supportés: PNG, JPG, WebP. Importation directe sur le modèle.
                    </p>
                  </div>
                </div>

                {/* Forme de la photo */}
                <div>
                  <label className="block font-bold mb-1.5">Forme de la Photo :</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'ronde', label: 'Ronde', class: 'rounded-full' },
                      { id: 'arrondie', label: 'Arrondie', class: 'rounded-xl' },
                      { id: 'carree', label: 'Carrée', class: 'rounded-none' },
                      { id: 'arche', label: 'Arche', class: 'rounded-t-full' },
                      { id: 'hexagone', label: 'Hexagone', class: 'rounded-xl rotate-45' },
                      { id: 'galet', label: 'Galet', class: 'rounded-[40%_60%_70%_30%]' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPhotoForme(f.id as any)}
                        className={`p-2 border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          photoForme === f.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-slate-400 dark:bg-slate-500 ${f.class}`} />
                        <span className="text-[10px]">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Taille & Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold mb-1">
                      Taille de la photo ({photoTaille} px)
                    </label>
                    <input
                      type="range"
                      min={50}
                      max={220}
                      value={photoTaille}
                      onChange={(e) => setPhotoTaille(parseInt(e.target.value, 10))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Emplacement de la photo</label>
                    <div className="flex bg-white dark:bg-slate-900 p-0.5 border border-slate-300 dark:border-slate-700 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPhotoPosition('in-header')}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                          photoPosition === 'in-header'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        En-tête
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoPosition('in-sidebar')}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                          photoPosition === 'in-sidebar'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Sidebar
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoPosition('free')}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                          photoPosition === 'free'
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Libre (Souris)
                      </button>
                    </div>
                  </div>
                </div>

                {/* BORDURES & ANNEAU DÉCORATIF PHOTO */}
                <div className="p-3 bg-blue-50/50 dark:bg-slate-900/60 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[11px] text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Bordure & Anneau Décoratif Photo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Épaisseur Bordure Photo */}
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Épaisseur :</span>
                        <span className="text-blue-600 font-bold">{photoBordureEpaisseur} px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={12}
                        value={photoBordureEpaisseur}
                        onChange={(e) => setPhotoBordureEpaisseur(parseInt(e.target.value, 10))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Couleur Bordure Photo */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Couleur Bordure :</span>
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input
                          type="color"
                          value={photoBordureCouleur}
                          onChange={(e) => setPhotoBordureCouleur(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-[10px] font-mono font-bold">{photoBordureCouleur}</span>
                      </div>
                    </div>

                    {/* Anneau Décoratif */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Cadre Décoratif :</span>
                      <select
                        value={cadrePhotoRing}
                        onChange={(e) => setCadrePhotoRing(e.target.value as any)}
                        className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      >
                        <option value="none">Standard</option>
                        <option value="double-ring">Double Anneau</option>
                        <option value="gold-ring">Anneau Doré</option>
                        <option value="accent-ring">Anneau Accent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BARRES DE POSITION X ET Y */}
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[11px] text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                      <Move className="w-3.5 h-3.5" />
                      <span>Position Exacte de la Photo (X / Y)</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-200">
                      X: {photoX}% | Y: {photoY}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Horizontale (X) :</span>
                        <span className="text-blue-600 font-mono">{photoX}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={95}
                        value={photoX}
                        onChange={(e) => {
                          setPhotoX(parseInt(e.target.value, 10));
                          setPhotoPosition('free');
                        }}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Verticale (Y) :</span>
                        <span className="text-blue-600 font-mono">{photoY}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={95}
                        value={photoY}
                        onChange={(e) => {
                          setPhotoY(parseInt(e.target.value, 10));
                          setPhotoPosition('free');
                        }}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Hauteur de la partie profil / en-tête */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-xs">Hauteur de l'En-tête / Section Profil</label>
                    <span className="text-blue-600 font-bold text-xs">{hauteurEnTetePx} px</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={250}
                    value={hauteurEnTetePx}
                    onChange={(e) => setHauteurEnTetePx(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: COORDONNÉES ET CONTACT */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <h4 className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>Coordonnées de Contact</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse e-mail</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="exemple@email.com"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Téléphone</span>
                </label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse / Ville</span>
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Paris, France"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 flex items-center gap-1">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                  <span>LinkedIn / Profil Web</span>
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="linkedin.com/in/dupont"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Appliquer les modifications</span>
          </button>
        </div>
      </div>
    </div>
  );
};
