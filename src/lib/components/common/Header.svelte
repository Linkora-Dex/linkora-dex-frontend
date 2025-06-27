<script>
  import { page } from '$app/stores';
  import ConnectWallet from './ConnectWallet.svelte';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import { goto } from '$app/navigation';
  import { t } from '$lib/utils/i18n.js';

  let showTradeDropdown = false;
  let showEarnDropdown = false;
  let showMoreDropdown = false;
  let mobileMenuOpen = false;

  // Навигация с переводами
  $: navigation = [

    {
      name: $t('header.trade'),
      href: '/trade',
      dropdown: [
        { name: $t('header.trade'), href: '/trade' },
        { name: $t('header.markets'), href: '/markets' },
        { name: $t('header.swap'), href: '/swap' }
      ]
    },
    {
      name: $t('header.portfolio'),
      href: '/portfolio'
    },


    {
      name: $t('header.earn'),
      href: '/earn',
      dropdown: [
        { name: $t('header.pools'), href: '/earn/pools' }
      ]
    },
    {
      name: $t('header.more'),
      href: '#',
      dropdown: [
        { name: $t('header.help'), href: '/help' },
        { name: $t('header.settings'), href: '/settings' }
      ]
    }
  ];

  function isActive(href) {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }

  function toggleDropdown(name, event) {
    event.preventDefault();
    event.stopPropagation();

    if (name === $t('header.trade')) {
      showTradeDropdown = !showTradeDropdown;
      showEarnDropdown = false;
      showMoreDropdown = false;
    } else if (name === $t('header.earn')) {
      showEarnDropdown = !showEarnDropdown;
      showTradeDropdown = false;
      showMoreDropdown = false;
    } else if (name === $t('header.more')) {
      showMoreDropdown = !showMoreDropdown;
      showTradeDropdown = false;
      showEarnDropdown = false;
    }
  }

  function closeDropdowns() {
    showTradeDropdown = false;
    showEarnDropdown = false;
    showMoreDropdown = false;
  }

  function handleWindowClick(event) {
    // Не закрываем дропдауны если клик внутри language-switcher
    if (event.target?.closest('.language-switcher')) {
      return;
    }
    closeDropdowns();
  }

  function handleNavigation(href, event) {
    event.preventDefault();
    event.stopPropagation();

    if (href !== '#') {
      goto(href);
    }
    closeDropdowns();
    mobileMenuOpen = false;
  }

  function handleMobileToggle(name, event) {
    event.preventDefault();
    event.stopPropagation();

    if (name === $t('header.trade')) {
      showTradeDropdown = !showTradeDropdown;
      showEarnDropdown = false;
      showMoreDropdown = false;
    } else if (name === $t('header.earn')) {
      showEarnDropdown = !showEarnDropdown;
      showTradeDropdown = false;
      showMoreDropdown = false;
    } else if (name === $t('header.more')) {
      showMoreDropdown = !showMoreDropdown;
      showTradeDropdown = false;
      showEarnDropdown = false;
    }
  }
</script>

<header class="bg-white border-b border-gray-200">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <button on:click={() => goto('/')} class="text-2xl font-bold text-primary-600">
            DEX
          </button>
        </div>

        <div class="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
          <div class="relative"></div>
          {#each navigation as item}
            <div class="relative">
              {#if item.dropdown}
                <button
                  class="inline-flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors
                    {isActive(item.href)
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
                  on:click={(e) => toggleDropdown(item.name, e)}
                >
                  {item.name}
                  <svg class="ml-1 h-4 w-4 transform transition-transform
                    {(item.name === $t('header.trade') && showTradeDropdown) ||
                     (item.name === $t('header.earn') && showEarnDropdown) ||
                     (item.name === $t('header.more') && showMoreDropdown) ? 'rotate-180' : ''}"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {#if (item.name === $t('header.trade') && showTradeDropdown) || (item.name === $t('header.earn') && showEarnDropdown) || (item.name === $t('header.more') && showMoreDropdown)}
                  <div class="absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 fade-in">
                    <div class="py-1">
                      {#each item.dropdown as dropdownItem}
                        <button
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          on:click={(e) => handleNavigation(dropdownItem.href, e)}
                        >
                          {dropdownItem.name}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              {:else}
                <button
                  class="inline-flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors
                    {isActive(item.href)
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
                  on:click={(e) => handleNavigation(item.href, e)}
                >
                  {item.name}
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <div class="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
        <LanguageSwitcher />
        <ConnectWallet />
      </div>

      <div class="sm:hidden flex items-center">
        <button
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if mobileMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
      </div>
    </div>

    {#if mobileMenuOpen}
      <div class="sm:hidden fade-in">
        <div class="pt-2 pb-3 space-y-1">
          {#each navigation as item}
            {#if item.dropdown}
              <div class="border-l-4 border-transparent">
                <button
                  class="flex items-center justify-between w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  on:click={(e) => handleMobileToggle(item.name, e)}
                >
                  <span>{item.name}</span>
                  <svg class="h-4 w-4 transform transition-transform
                    {(item.name === $t('header.trade') && showTradeDropdown) ||
                     (item.name === $t('header.earn') && showEarnDropdown) ||
                     (item.name === $t('header.more') && showMoreDropdown) ? 'rotate-180' : ''}"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {#if (item.name === $t('header.trade') && showTradeDropdown) || (item.name === $t('header.earn') && showEarnDropdown) || (item.name === $t('header.more') && showMoreDropdown)}
                  <div class="bg-gray-50">
                    {#each item.dropdown as dropdownItem}
                      <button
                        class="block w-full text-left pl-6 pr-4 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                        on:click={(e) => handleNavigation(dropdownItem.href, e)}
                      >
                        {dropdownItem.name}
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {:else}
              <button
                class="block w-full text-left border-l-4 pl-3 pr-4 py-2 text-base font-medium transition-colors
                  {isActive(item.href)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}"
                on:click={(e) => handleNavigation(item.href, e)}
              >
                {item.name}
              </button>
            {/if}
          {/each}
          <div class="pt-4 pb-3 border-t border-gray-200 px-3">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Language</span>
                <LanguageSwitcher />
              </div>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>

<svelte:window on:click={handleWindowClick} />