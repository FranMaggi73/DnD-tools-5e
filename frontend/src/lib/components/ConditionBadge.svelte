<script lang="ts">
  import { conditionIcon, conditionLabel } from '$lib/rules/2024';
  export let condition: string;
</script>

<span class="condition-badge tooltip" data-tip={conditionLabel(condition)} tabindex="0" role="img" aria-label={conditionLabel(condition)} title={conditionLabel(condition)}>
  <span class="badge badge-warning h-8 min-w-8 px-2 text-lg" aria-hidden="true">{conditionIcon(condition)}</span>
</span>

<style>
  .condition-badge:focus-visible { outline: 2px solid #654321; outline-offset: 2px; border-radius: 0.5rem; }
  .condition-badge:focus-visible::before,
  .condition-badge:focus-visible::after { opacity: 1; transition-delay: 0ms; }
</style>
