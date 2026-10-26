<script lang="ts">
 import CharacterChoicesChecklist from './CharacterChoicesChecklist.svelte';
 import type {Character} from '$lib/types';import {normalizeBuild} from '$lib/rules/characterBuilder';import OptionReference from './OptionReference.svelte';import CharacterSpellbook from './CharacterSpellbook.svelte';
 export let character:Character;$: build=normalizeBuild(character.build);
</script>
{#if build.species.name||build.class.name||build.background.name||build.spells.length||build.customFeatures.length||build.tools||build.weapons||build.armor||build.languages||build.lineage||build.choices||build.feats.length}
 <details class="p-2 space-y-2 border border-primary/30 rounded-lg text-neutral">
 <summary class="font-medieval text-sm font-bold cursor-pointer">Origen, rasgos y magia</summary>
 <CharacterChoicesChecklist form={character} readonly/>
 <div class="flex flex-wrap gap-1">{#each [build.species,build.variant,build.subclass,build.background,...build.feats] as ref}{#if ref.name}<span class="badge badge-outline h-auto py-1">{ref.name}</span>{/if}{/each}</div>
 {#if build.lineage}<p class="text-sm">Linaje: {build.lineage}</p>{/if}
 {#each [['Armas',build.weapons],['Armaduras',build.armor],['Herramientas',build.tools],['Idiomas',build.languages]] as [label,value]}{#if value}<p class="text-sm"><strong>{label}:</strong> {value}</p>{/if}{/each}
 {#each [build.class,build.subclass,build.species,build.variant,build.background,...build.feats] as ref}{#if ref.key}<OptionReference optionKey={ref.key} level={character.level}/>{/if}{/each}
 {#if build.choices}<details><summary class="cursor-pointer font-semibold">Elecciones y notas</summary><p class="whitespace-pre-wrap break-words text-sm">{build.choices}</p></details>{/if}
 {#each build.customFeatures as feature}<details><summary class="cursor-pointer font-semibold">{feature.name||'Rasgo personalizado'}</summary><p class="whitespace-pre-wrap break-words text-sm">{feature.desc}</p></details>{/each}
 {#if build.spells.length||build.castingAbility!=='none'}<CharacterSpellbook {build} level={character.level} abilityScores={character.abilityScores} editable={false}/>{/if}
 </details>
{/if}
