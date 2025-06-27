import { translations as en } from '../translations/en.js';
import { translations as de } from '../translations/de.js';
import { currentLanguage } from '../stores/language.js';
import { derived } from 'svelte/store';

const translations = {
  en,
  de
};

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export const t = derived(currentLanguage, ($currentLanguage) => {
  return (key, defaultValue = key) => {
    const translation = getNestedValue(translations[$currentLanguage], key);
    return translation || defaultValue;
  };
});

export const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];