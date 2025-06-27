<script>
  import { currentLanguage } from '$lib/stores/language.js';
  import { availableLanguages } from '$lib/utils/i18n.js';

  let showDropdown = false;
  let selectedLanguage = 'en';

  currentLanguage.subscribe(lang => {
    selectedLanguage = lang;
  });

  function selectLanguage(langCode, event) {
    event?.preventDefault();
    event?.stopPropagation();
    console.log('Selecting language:', langCode); // Для отладки
    currentLanguage.setLanguage(langCode);
    showDropdown = false;
  }

  function toggleDropdown(event) {
    event?.preventDefault();
    event?.stopPropagation();
    console.log('Toggling dropdown, current state:', showDropdown); // Для отладки
    showDropdown = !showDropdown;
  }

  function closeDropdown(event) {
    // Проверяем, что клик не внутри компонента
    if (event?.target?.closest('.language-switcher')) {
      return;
    }
    showDropdown = false;
  }

  $: currentLangData = availableLanguages.find(lang => lang.code === selectedLanguage);
</script>

<div class="relative language-switcher">
  <button
    on:click={toggleDropdown}
    class="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full sm:w-auto justify-between sm:justify-start"
  >
    <div class="flex items-center space-x-2">
      <span class="text-lg">{currentLangData?.flag}</span>
      <span class="block">{currentLangData?.name}</span>
    </div>
    <svg class="w-4 h-4 transform transition-transform {showDropdown ? 'rotate-180' : ''}"
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if showDropdown}
    <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50 fade-in">
      <div class="py-1">
        {#each availableLanguages as language}
          <button
            class="flex items-center space-x-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors
              {selectedLanguage === language.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}"
            on:click={(e) => selectLanguage(language.code, e)}
          >
            <span class="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {#if selectedLanguage === language.code}
              <svg class="w-4 h-4 ml-auto text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<svelte:window on:click={closeDropdown} />