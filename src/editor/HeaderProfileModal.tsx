import React, { useState } from 'react';
import { CV } from '../types';
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
  Sparkles
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

  const [nom, setNom] = useState(cv.nom || '');
  const [prenom, setPrenom] = useState(cv.prenom || '');
  const [titrePoste, setTitrePoste] = useState(cv.titrePoste || cv.titreCV || '');
  const [email, setEmail] = useState(cv.email || '');
  const [telephone, setTelephone] = useState(cv.telephone || '');
  const [adresse, setAdresse] = useState(cv.adresse || '');
  const [permis, setPermis] = useState(cv.permis || '');
  const [linkedin, setLinkedin] = useState(cv.linkedin || '');
  const [siteWeb, setSiteWeb] = useState(cv.siteWeb || '');

  const [afficherPhoto, setAfficherPhoto] = useState(cv.afficherPhoto !== false && Boolean(cv.photoUrl));
  const [photoUrl, setPhotoUrl] = useState(cv.photoUrl || '');
  const [photoForme, setPhotoForme] = useState<'ronde' | 'carree' | 'arrondie' | 'hexagone' | 'arche' | 'galet'>(
    cv.photoForme || 'ronde'
  );
  const [photoTaille, setPhotoTaille] = useState(cv.photoTaille || 110);
  const [photoPosition, setPhotoPosition] = useState<'in-header' | 'in-sidebar'>(
    cv.photoPosition || 'in-header'
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoUrl(dataUrl);
      setAfficherPhoto(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setAfficherPhoto(false);
  };

  const handleSave = () => {
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
      afficherPhoto,
      photoUrl,
      photoForme,
      photoTaille,
      photoPosition
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
          </div>

          {/* SECTION 2: GESTION & FORME DE LA PHOTO */}
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
                      min={60}
                      max={200}
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
                        className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          photoPosition === 'in-header'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Dans l'En-tête
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoPosition('in-sidebar')}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                          photoPosition === 'in-sidebar'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Dans la Sidebar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: COORDONNÉES ET CONTACT */}
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
