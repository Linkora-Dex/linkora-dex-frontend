<script>
  import '../app.css';
  import Header from '$lib/components/common/Header.svelte';
  import Footer from '$lib/components/common/Footer.svelte';
</script>

<svelte:head>
  <title>DEX Trading Platform</title>
  <meta name="description" content="Decentralized exchange for crypto trading" />
</svelte:head>

<div class="min-h-screen flex flex-col">
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Footer />
</div>