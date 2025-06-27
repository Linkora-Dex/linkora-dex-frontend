<script>
  export let type = 'text';
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let error = '';
  export let label = '';
  export let required = false;

  $: inputClasses = [
    'block w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500',
    disabled ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'
  ].join(' ');
</script>

<div class="space-y-1">
  {#if label}
    <label class="block text-sm font-medium text-gray-700">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <input
    {type}
    {placeholder}
    {disabled}
    bind:value
    class={inputClasses}
    on:input
    on:change
    on:focus
    on:blur
    {...$restProps}
  />

  {#if error}
    <p class="text-sm text-red-600">{error}</p>
  {/if}
</div>