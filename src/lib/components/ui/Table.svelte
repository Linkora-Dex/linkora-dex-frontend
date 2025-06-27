<script>
  export let columns = [];
  export let data = [];
  export let loading = false;
  export let emptyMessage = 'No data available';
</script>

<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    {#if columns.length > 0}
      <thead class="bg-gray-50">
        <tr>
          {#each columns as column}
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              class:text-right={column.align === 'right'}
              class:text-center={column.align === 'center'}
            >
              {column.label}
            </th>
          {/each}
        </tr>
      </thead>
    {/if}

    <tbody class="bg-white divide-y divide-gray-200">
      {#if loading}
        <tr>
          <td colspan={columns.length} class="px-6 py-4 text-center">
            <div class="flex justify-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          </td>
        </tr>
      {:else if data.length === 0}
        <tr>
          <td colspan={columns.length} class="px-6 py-12 text-center text-gray-500">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row, rowIndex}
          <tr class="hover:bg-gray-50">
            {#each columns as column, colIndex}
              <td
                class="px-6 py-4 whitespace-nowrap text-sm"
                class:text-right={column.align === 'right'}
                class:text-center={column.align === 'center'}
                class:font-medium={column.bold}
                class:font-mono={column.mono}
              >
                {#if column.render}
                  {@html column.render(row[column.key], row, rowIndex)}
                {:else}
                  {row[column.key] || '-'}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>