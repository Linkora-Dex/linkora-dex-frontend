import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultLanguage = 'en';

function createLanguageStore() {
  // Инициализируем язык из localStorage или браузера
  let initialLanguage = defaultLanguage;

  if (browser) {
    try {
      const savedLanguage = localStorage.getItem('selected_language');
      console.log('Saved language from localStorage:', savedLanguage);

      if (savedLanguage && ['en', 'de'].includes(savedLanguage)) {
        initialLanguage = savedLanguage;
      } else {
        // Определяем язык браузера
        const browserLanguage = navigator.language.split('-')[0];
        console.log('Browser language detected:', browserLanguage);

        if (['en', 'de'].includes(browserLanguage)) {
          initialLanguage = browserLanguage;
        }
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  }

  console.log('Initial language set to:', initialLanguage);
  const { subscribe, set } = writable(initialLanguage);

  function saveLanguage(language) {
    if (browser) {
      try {
        localStorage.setItem('selected_language', language);
        console.log('Language saved to localStorage:', language);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
  }

  return {
    subscribe,
    setLanguage: (language) => {
      console.log('setLanguage called with:', language);
      if (['en', 'de'].includes(language)) {
        set(language);
        saveLanguage(language);
        console.log('Language successfully changed to:', language);
      } else {
        console.error('Invalid language code:', language);
      }
    }
  };
}

export const currentLanguage = createLanguageStore();