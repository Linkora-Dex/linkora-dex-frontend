<script>
  import { goto } from '$app/navigation';
  import { t } from '$lib/utils/i18n.js';

  let activeCategory = 'getting-started';

  $: categories = [
    { id: 'getting-started', title: $t('help.categories.gettingStarted'), icon: '🚀' },
    { id: 'trading', title: $t('help.categories.trading'), icon: '📊' },
    { id: 'defi', title: $t('help.categories.defi'), icon: '🏦' },
    { id: 'security', title: $t('help.categories.security'), icon: '🔒' },
    { id: 'troubleshooting', title: $t('help.categories.troubleshooting'), icon: '🔧' }
  ];

  $: helpContent = {
    'getting-started': {
      title: $t('help.gettingStarted.title'),
      sections: [
        {
          title: $t('help.gettingStarted.connectWallet.title'),
          content: $t('help.gettingStarted.connectWallet.content'),
          steps: [
            $t('help.gettingStarted.connectWallet.steps.0'),
            $t('help.gettingStarted.connectWallet.steps.1'),
            $t('help.gettingStarted.connectWallet.steps.2'),
            $t('help.gettingStarted.connectWallet.steps.3')
          ]
        },
        {
          title: $t('help.gettingStarted.depositFunds.title'),
          content: $t('help.gettingStarted.depositFunds.content'),
          steps: [
            $t('help.gettingStarted.depositFunds.steps.0'),
            $t('help.gettingStarted.depositFunds.steps.1'),
            $t('help.gettingStarted.depositFunds.steps.2'),
            $t('help.gettingStarted.depositFunds.steps.3')
          ]
        },
        {
          title: $t('help.gettingStarted.startTrading.title'),
          content: $t('help.gettingStarted.startTrading.content'),
          steps: [
            $t('help.gettingStarted.startTrading.steps.0'),
            $t('help.gettingStarted.startTrading.steps.1'),
            $t('help.gettingStarted.startTrading.steps.2'),
            $t('help.gettingStarted.startTrading.steps.3')
          ]
        }
      ]
    },
    'trading': {
      title: $t('help.trading.title'),
      sections: [
        {
          title: $t('help.trading.orderTypes.title'),
          content: $t('help.trading.orderTypes.content'),
          subsections: [
            {
              title: $t('help.trading.orderTypes.limit.title'),
              description: $t('help.trading.orderTypes.limit.description'),
              features: [
                $t('help.trading.orderTypes.limit.features.0'),
                $t('help.trading.orderTypes.limit.features.1'),
                $t('help.trading.orderTypes.limit.features.2')
              ]
            },
            {
              title: $t('help.trading.orderTypes.stopLoss.title'),
              description: $t('help.trading.orderTypes.stopLoss.description'),
              features: [
                $t('help.trading.orderTypes.stopLoss.features.0'),
                $t('help.trading.orderTypes.stopLoss.features.1'),
                $t('help.trading.orderTypes.stopLoss.features.2')
              ]
            },
            {
              title: $t('help.trading.orderTypes.market.title'),
              description: $t('help.trading.orderTypes.market.description'),
              features: [
                $t('help.trading.orderTypes.market.features.0'),
                $t('help.trading.orderTypes.market.features.1'),
                $t('help.trading.orderTypes.market.features.2')
              ]
            }
          ]
        },
        {
          title: $t('help.trading.leveraged.title'),
          content: $t('help.trading.leveraged.content'),
          steps: [
            $t('help.trading.leveraged.steps.0'),
            $t('help.trading.leveraged.steps.1'),
            $t('help.trading.leveraged.steps.2'),
            $t('help.trading.leveraged.steps.3'),
            $t('help.trading.leveraged.steps.4')
          ],
          risks: [
            $t('help.trading.leveraged.risks.0'),
            $t('help.trading.leveraged.risks.1'),
            $t('help.trading.leveraged.risks.2')
          ]
        }
      ]
    },
    'defi': {
      title: $t('help.defi.title'),
      sections: [
        {
          title: $t('help.defi.liquidity.title'),
          content: $t('help.defi.liquidity.content'),
          steps: [
            $t('help.defi.liquidity.steps.0'),
            $t('help.defi.liquidity.steps.1'),
            $t('help.defi.liquidity.steps.2'),
            $t('help.defi.liquidity.steps.3'),
            $t('help.defi.liquidity.steps.4')
          ]
        },
        {
          title: $t('help.defi.staking.title'),
          content: $t('help.defi.staking.content'),
          benefits: [
            $t('help.defi.staking.benefits.0'),
            $t('help.defi.staking.benefits.1'),
            $t('help.defi.staking.benefits.2'),
            $t('help.defi.staking.benefits.3')
          ]
        },
        {
          title: $t('help.defi.keeper.title'),
          content: $t('help.defi.keeper.content'),
          requirements: [
            $t('help.defi.keeper.requirements.0'),
            $t('help.defi.keeper.requirements.1'),
            $t('help.defi.keeper.requirements.2'),
            $t('help.defi.keeper.requirements.3')
          ]
        }
      ]
    },
    'security': {
      title: $t('help.security.title'),
      sections: [
        {
          title: $t('help.security.smartContract.title'),
          content: $t('help.security.smartContract.content'),
          features: [
            $t('help.security.smartContract.features.0'),
            $t('help.security.smartContract.features.1'),
            $t('help.security.smartContract.features.2'),
            $t('help.security.smartContract.features.3'),
            $t('help.security.smartContract.features.4')
          ]
        },
        {
          title: $t('help.security.flashLoan.title'),
          content: $t('help.security.flashLoan.content'),
          mechanisms: [
            $t('help.security.flashLoan.mechanisms.0'),
            $t('help.security.flashLoan.mechanisms.1'),
            $t('help.security.flashLoan.mechanisms.2'),
            $t('help.security.flashLoan.mechanisms.3')
          ]
        },
        {
          title: $t('help.security.bestPractices.title'),
          content: $t('help.security.bestPractices.content'),
          tips: [
            $t('help.security.bestPractices.tips.0'),
            $t('help.security.bestPractices.tips.1'),
            $t('help.security.bestPractices.tips.2'),
            $t('help.security.bestPractices.tips.3'),
            $t('help.security.bestPractices.tips.4')
          ]
        }
      ]
    },
    'troubleshooting': {
      title: $t('help.troubleshooting.title'),
      sections: [
        {
          title: $t('help.troubleshooting.walletConnection.title'),
          content: $t('help.troubleshooting.walletConnection.content'),
          solutions: [
            $t('help.troubleshooting.walletConnection.solutions.0'),
            $t('help.troubleshooting.walletConnection.solutions.1'),
            $t('help.troubleshooting.walletConnection.solutions.2'),
            $t('help.troubleshooting.walletConnection.solutions.3'),
            $t('help.troubleshooting.walletConnection.solutions.4')
          ]
        },
        {
          title: $t('help.troubleshooting.transactionFailures.title'),
          content: $t('help.troubleshooting.transactionFailures.content'),
          causes: [
            $t('help.troubleshooting.transactionFailures.causes.0'),
            $t('help.troubleshooting.transactionFailures.causes.1'),
            $t('help.troubleshooting.transactionFailures.causes.2'),
            $t('help.troubleshooting.transactionFailures.causes.3'),
            $t('help.troubleshooting.transactionFailures.causes.4')
          ]
        },
        {
          title: $t('help.troubleshooting.orderExecution.title'),
          content: $t('help.troubleshooting.orderExecution.content'),
          checks: [
            $t('help.troubleshooting.orderExecution.checks.0'),
            $t('help.troubleshooting.orderExecution.checks.1'),
            $t('help.troubleshooting.orderExecution.checks.2'),
            $t('help.troubleshooting.orderExecution.checks.3'),
            $t('help.troubleshooting.orderExecution.checks.4')
          ]
        }
      ]
    }
  };

  function setActiveCategory(categoryId) {
    activeCategory = categoryId;
  }

  function openTradingApp() {
    goto('/trade');
  }
</script>

<svelte:head>
  <title>{$t('help.meta.title')}</title>
  <meta name="description" content={$t('help.meta.description')} />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">{$t('help.header.title')}</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          {$t('help.header.subtitle')}
        </p>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm p-6 sticky top-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">{$t('help.sidebar.title')}</h3>
          <nav class="space-y-2">
            {#each categories as category}
              <button
                class="flex items-center w-full px-3 py-2 text-left rounded-md transition-colors {activeCategory === category.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
                on:click={() => setActiveCategory(category.id)}
              >
                <span class="mr-3">{category.icon}</span>
                {category.title}
              </button>
            {/each}
          </nav>

          <div class="mt-8 pt-6 border-t border-gray-200">
            <button
              on:click={openTradingApp}
              class="w-full bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              {$t('help.sidebar.launchButton')}
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-lg shadow-sm">
          {#if helpContent[activeCategory]}
            {@const content = helpContent[activeCategory]}
            <div class="p-8">
              <h2 class="text-3xl font-bold text-gray-900 mb-6">{content.title}</h2>

              {#each content.sections as section}
                <div class="mb-8">
                  <h3 class="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>

                  {#if section.content}
                    <p class="text-gray-700 mb-4">{section.content}</p>
                  {/if}

                  {#if section.steps}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.steps')}</h4>
                      <ol class="list-decimal list-inside space-y-2 text-gray-700">
                        {#each section.steps as step}
                          <li>{step}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}

                  {#if section.features}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.features')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-gray-700">
                        {#each section.features as feature}
                          <li>{feature}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.subsections}
                    <div class="space-y-6">
                      {#each section.subsections as subsection}
                        <div class="bg-gray-50 rounded-lg p-4">
                          <h4 class="font-semibold text-gray-900 mb-2">{subsection.title}</h4>
                          <p class="text-gray-700 mb-3">{subsection.description}</p>
                          {#if subsection.features}
                            <ul class="list-disc list-inside space-y-1 text-gray-600 text-sm">
                              {#each subsection.features as feature}
                                <li>{feature}</li>
                              {/each}
                            </ul>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}

                  {#if section.risks}
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <h4 class="font-medium text-red-900 mb-2">⚠️ {$t('help.labels.risks')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-red-700 text-sm">
                        {#each section.risks as risk}
                          <li>{risk}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.benefits}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.benefits')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-gray-700">
                        {#each section.benefits as benefit}
                          <li>{benefit}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.requirements}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.requirements')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-gray-700">
                        {#each section.requirements as requirement}
                          <li>{requirement}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.mechanisms}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.mechanisms')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-gray-700">
                        {#each section.mechanisms as mechanism}
                          <li>{mechanism}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.tips}
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 class="font-medium text-blue-900 mb-2">💡 {$t('help.labels.tips')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        {#each section.tips as tip}
                          <li>{tip}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.solutions}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.solutions')}</h4>
                      <ol class="list-decimal list-inside space-y-1 text-gray-700">
                        {#each section.solutions as solution}
                          <li>{solution}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}

                  {#if section.causes}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.causes')}</h4>
                      <ul class="list-disc list-inside space-y-1 text-gray-700">
                        {#each section.causes as cause}
                          <li>{cause}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}

                  {#if section.checks}
                    <div class="mb-4">
                      <h4 class="font-medium text-gray-900 mb-2">{$t('help.labels.checks')}</h4>
                      <ol class="list-decimal list-inside space-y-1 text-gray-700">
                        {#each section.checks as check}
                          <li>{check}</li>
                        {/each}
                      </ol>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Footer CTA -->
  <div class="bg-primary-600 mt-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h3 class="text-2xl font-bold text-white mb-4">{$t('help.footer.title')}</h3>
      <p class="text-primary-100 mb-6">
        {$t('help.footer.subtitle')}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on:click={openTradingApp}
          class="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          {$t('help.footer.startTradingButton')}
        </button>
        <a
          href="https://github.com/dex-protocol"
          target="_blank"
          class="bg-transparent text-white border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
        >
          {$t('help.footer.githubButton')}
        </a>
      </div>
    </div>
  </div>
</div>