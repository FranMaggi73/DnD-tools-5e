<script lang="ts">import {createEventDispatcher} from 'svelte';const dispatch=createEventDispatcher();export let canViewSheet=false;import type {PublicCombatant} from '$lib/rules/tablePlay';import ConditionBadge from './ConditionBadge.svelte';export let fighter:PublicCombatant;export let current=false;</script>
<article class={`card-parchment p-3 space-y-2 text-neutral ${current?'ring-2 ring-secondary':''}`}>
 <div class="flex gap-2"><h3 class="font-medieval font-bold flex-1">{fighter.name}</h3><span class="badge badge-outline">🎲 {fighter.initiative}</span></div>{#if current}<span class="badge badge-success">Turno actual</span>{/if}
 {#if fighter.currentHp!==null}<p class="text-sm">Vida: {fighter.currentHp}/{fighter.maxHp} · CA {fighter.armorClass}</p>{:else}<p class="text-sm">Estadísticas reservadas por el DM</p>{/if}
 <div class="flex flex-wrap gap-1">{#each fighter.conditions as condition}<ConditionBadge {condition}/>{/each}{#if !fighter.conditions.length}<span class="text-xs">Sin condiciones</span>{/if}</div>
{#if canViewSheet}<button type="button" class="btn btn-sm btn-outline border-primary/60 text-neutral w-full" aria-label={`Ver ficha de ${fighter.name}`} on:click={()=>dispatch('viewSheet',fighter)}>📋 Ver ficha</button>{/if}
</article>
