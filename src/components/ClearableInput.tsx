import React from 'react';
import { X } from 'lucide-react';

export interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
  onClear?: () => void;
  containerClassName?: string;
}

export const ClearableInput: React.FC<ClearableInputProps> = ({
  value,
  onChange,
  onClear,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}) => {
  const strVal = value !== undefined && value !== null ? String(value) : '';
  const showClear = strVal.length > 0 && type !== 'range' && type !== 'color' && type !== 'checkbox' && type !== 'radio' && type !== 'file';

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`relative flex items-center w-full min-w-0 ${containerClassName}`}>
      <input
        {...props}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full min-w-0 transition-all ${className} ${showClear ? '!pr-9' : ''}`}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          title="Effacer le texte"
          aria-label="Effacer le texte"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export interface ClearableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onClear?: () => void;
  containerClassName?: string;
}

export const ClearableTextarea: React.FC<ClearableTextareaProps> = ({
  value,
  onChange,
  onClear,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const strVal = value !== undefined && value !== null ? String(value) : '';
  const showClear = strVal.length > 0;

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClear) {
      onClear();
    } else if (onChange) {
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`relative w-full min-w-0 ${containerClassName}`}>
      <textarea
        {...props}
        value={value}
        onChange={onChange}
        className={`w-full min-w-0 transition-all ${className} ${showClear ? '!pr-9' : ''}`}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          title="Effacer le texte"
          aria-label="Effacer le texte"
          className="absolute right-2.5 top-2.5 p-1 rounded-full text-neutral-400 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
