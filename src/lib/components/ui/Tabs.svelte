<script>
  export let tabs = [];
  export let activeTab = '';
  export let onTabChange = () => {};
</script>

<div class="border-b border-gray-200">
  <nav class="-mb-px flex space-x-8">
    {#each tabs as tab}
      <button
        class="py-4 px-1 border-b-2 font-medium text-sm transition-colors
          {activeTab === tab.id
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
        on:click={() => onTabChange(tab.id)}
      >
        {#if tab.icon}
          <span class="mr-2">{tab.icon}</span>
        {/if}
        {tab.name}
      </button>
    {/each}
  </nav>
</div>