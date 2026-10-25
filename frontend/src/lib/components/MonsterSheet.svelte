<script lang="ts">
  import type { Monster, Combatant } from '$lib/types';
  import { formatModifier, getAbilityModifier } from '$lib/types';
  export let monster: Monster;
  export let combatant: Combatant;
  const abilities = [
    {key:'strength',label:'FUE'},{key:'dexterity',label:'DES'},{key:'constitution',label:'CON'},
    {key:'intelligence',label:'INT'},{key:'wisdom',label:'SAB'},{key:'charisma',label:'CAR'}
  ] as const;
  const speedLabels: Record<string,string> = {walk:'Caminar',fly:'Volar',swim:'Nadar',burrow:'Excavar',climb:'Trepar'};
  function saves(value: Monster) {
    return abilities.flatMap(({key,label}) => {
      const bonus=value[`${key}_save` as keyof Monster];
      return typeof bonus === 'number' ? [`${label} ${formatModifier(bonus)}`] : [];
    }).join(' · ') || '—';
  }
  $: sections = [
    {label:'Rasgos',entries:monster.special_abilities}, {label:'Acciones',entries:monster.actions},
    {label:'Acciones adicionales',entries:monster.bonus_actions}, {label:'Reacciones',entries:monster.reactions},
    {label:'Acciones legendarias',entries:monster.legendary_actions}
  ];
</script>

<div class="space-y-4 text-neutral">
  <div>
    <h3 class="font-medieval text-xl font-bold">{monster.name}</h3>
    <p class="text-sm text-neutral/70">{monster.size} · {monster.type}{monster.subtype ? ` (${monster.subtype})` : ''} · {monster.alignment}</p>
    <p class="text-xs text-neutral/60 mt-1">Referencia: {monster.document__title || 'Open5e'} · Desafío {monster.challenge_rating}</p>
    {#if monster.catalogSource}<a class="link text-xs text-primary" href={`/sources#${monster.catalogSource.key}`}>{monster.catalogSource.edition} · Fuente y licencia</a>{/if}
  </div>
  <div class="grid grid-cols-3 gap-2 text-center">
    <div class="rounded border border-info/30 bg-info/10 p-2"><p class="text-xs">CA actual</p><p class="font-bold text-lg">{combatant.armorClass}</p></div>
    <div class="rounded border border-success/30 bg-success/10 p-2"><p class="text-xs">HP actuales</p><p class="font-bold text-lg">{combatant.currentHp}/{combatant.maxHp}</p></div>
    <div class="rounded border border-primary/30 bg-primary/10 p-2"><p class="text-xs">Iniciativa</p><p class="font-bold text-lg">{combatant.initiative}</p></div>
  </div>
  <p class="text-sm">Velocidad: {Object.entries(monster.speed || {}).filter(([,value]) => typeof value === 'number').map(([key,value]) => `${speedLabels[key] || key} ${value} pies`).join(' · ') || '—'}</p>
  <div class="grid grid-cols-3 min-[380px]:grid-cols-6 gap-2">
    {#each abilities as ability}
      <div class="rounded border border-primary/30 bg-primary/10 p-2 text-center"><p class="text-xs">{ability.label}</p><p class="font-bold text-lg">{formatModifier(getAbilityModifier(monster[ability.key]))}</p><p class="text-xs">({monster[ability.key]})</p></div>
    {/each}
  </div>
  <dl class="text-sm space-y-2">
    <div><dt class="font-bold inline">Salvaciones: </dt><dd class="inline">{saves(monster)}</dd></div>
    {#if Object.keys(monster.skills || {}).length}<div><dt class="font-bold inline">Habilidades: </dt><dd class="inline">{Object.entries(monster.skills || {}).map(([name,value]) => `${name} ${formatModifier(value)}`).join(' · ')}</dd></div>{/if}
    {#if monster.damage_vulnerabilities}<div><dt class="font-bold inline">Vulnerabilidades: </dt><dd class="inline">{monster.damage_vulnerabilities}</dd></div>{/if}
    {#if monster.damage_resistances}<div><dt class="font-bold inline">Resistencias: </dt><dd class="inline">{monster.damage_resistances}</dd></div>{/if}
    {#if monster.damage_immunities}<div><dt class="font-bold inline">Inmunidades al daño: </dt><dd class="inline">{monster.damage_immunities}</dd></div>{/if}
    {#if monster.condition_immunities}<div><dt class="font-bold inline">Inmunidades a condiciones: </dt><dd class="inline">{monster.condition_immunities}</dd></div>{/if}
    <div><dt class="font-bold inline">Sentidos: </dt><dd class="inline">{monster.senses || '—'}</dd></div>
    <div><dt class="font-bold inline">Idiomas: </dt><dd class="inline">{monster.languages || '—'}</dd></div>
  </dl>
  {#each sections as section}
    {#if section.entries?.length}
      <section class="space-y-2">
        <h3 class="font-medieval text-lg border-b border-primary/30">{section.label}</h3>
        {#if section.label === 'Acciones legendarias' && monster.legendary_desc}<p class="text-sm whitespace-pre-line">{monster.legendary_desc}</p>{/if}
        {#each section.entries as action}
          <article class="rounded border border-primary/20 bg-primary/5 p-3"><h4 class="font-bold">{action.name}</h4><p class="text-sm whitespace-pre-line mt-1">{action.desc}</p></article>
        {/each}
      </section>
    {/if}
  {/each}
  {#if monster.spell_list?.length}<p class="text-sm"><strong>Conjuros:</strong> {monster.spell_list.join(', ')}</p>{/if}
  {#if monster.desc}<p class="text-sm whitespace-pre-line">{monster.desc}</p>{/if}
</div>
