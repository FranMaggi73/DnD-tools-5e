<script lang="ts">
 import {fixedChoices} from '$lib/utils/catalogLabels';
 import type {CharacterForm} from '$lib/types';import {catalogApi} from '$lib/api/catalog';import {classSkillChoice} from '$lib/rules/characterBuilder';
 export let form:CharacterForm;let error='';let classAdvice='';let current='';
 $: if(form.build?.class.key!==current){current=form.build?.class.key||'';advice(current);}
 async function advice(key:string){classAdvice='';if(!key)return;try{const option=await catalogApi.getOption(key);if(current===key)classAdvice=classSkillChoice(option).text;}catch{}}
 async function background(){if(!form.build?.background.key)return;error='';try{const option=await catalogApi.getOption(form.build.background.key);const fixed=fixedChoices(option.mechanics?.skills);const row=option.features.find(f=>f.type==='skill_proficiency')?.desc||fixed.join(', ');if(/choose|either|or |choice/i.test(row)){error='El trasfondo requiere elegir habilidades: consultá sus rasgos y marcalas abajo.';return;}form.skills=form.skills.map(skill=>({...skill,proficient:skill.proficient||row.toLowerCase().includes(skill.name.toLowerCase())}));const tool=option.features.find(f=>f.type==='tool_proficiency')?.desc||fixedChoices(option.mechanics?.tools).join(', ');if(tool)form.build.tools=[...new Set([...form.build.tools.split(';').map(v=>v.trim()).filter(Boolean),tool])].join('; ');if(!row&&!tool)error='Esta opción requiere elegir competencias. Revisá sus datos en Rasgos y marcalas manualmente.';form=form;}catch{error='No se pudo cargar el trasfondo.';}}
</script>
{#if form.build}<div class="space-y-2 mb-4">
 <h4 class="font-medieval font-bold">Entrenamiento e idiomas</h4>
 {#if classAdvice}<p class="text-sm">Habilidades de clase: {classAdvice}</p>{/if}
 <button type="button" class="btn btn-sm" disabled={!form.build.background.key} on:click={background}>Añadir competencias fijas del trasfondo</button>
 {#if error}<p role="alert" class="text-error text-xs">{error}</p>{/if}
 {#each [['weapons','Armas'],['armor','Armaduras y escudos'],['tools','Herramientas'],['languages','Idiomas']] as [key,label]}<label class="block text-sm">{label}<input aria-label={label} class="input input-bordered input-sm w-full" maxlength="2000" bind:value={form.build[key]}/></label>{/each}
 <p class="text-xs">Marcá abajo las competencias y pericias obtenidas por clase, trasfondo y rasgos. Las elecciones no se suman dos veces.</p>
 </div>{/if}
