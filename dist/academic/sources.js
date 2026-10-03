/* Metadata-only library. Private files are not bundled or sent to analytics. */
(() => {
  'use strict';
  const categories={nexo:'Material Nexo',books:'Mis libros',class:'PPT / Guías',
    recordings:'Grabaciones',transcripts:'Transcripciones',exams:'Evaluaciones',
    manuals:'Manuales de laboratorio',open:'Recursos abiertos'};
  const kinds=new Set(['book','ppt','guide','exam','answer_key','recording','transcript','manual','lab_manual','web','other']);
  const authorities=new Set(['course_official','professor','recommended','supplementary','personal']);
  function validate(source) {
    if(!source?.id||!source.title?.trim()||!kinds.has(source.type))throw new Error('invalid_source');
    if(source.url&&!/^https:\/\//i.test(source.url))throw new Error('invalid_source_url');
    if(source.location&&typeof source.location!=='object')throw new Error('invalid_location');
    if(source.authority&&!authorities.has(source.authority))throw new Error('invalid_source_authority');
    return {...source,authority:source.authority||'personal',version:source.version||1};
  }
  function parseTranscript(text,type) {
    if(!['txt','vtt','srt'].includes(type))throw new Error('unsupported_transcript');
    const raw=String(text||'');if(raw.length>262144)throw new Error('transcript_too_large');
    if(type==='txt')return [{start:null,end:null,text:raw}];
    const stamp=value=>{
      const chunks=value.replace(',','.').split(':').map(Number);
      return chunks.length===3?chunks[0]*3600+chunks[1]*60+chunks[2]:
        chunks.length===2?chunks[0]*60+chunks[1]:NaN;
    };
    return raw.replace(/^WEBVTT[^\n]*\n/i,'').split(/\n\s*\n/).map(block=>{
      const lines=block.trim().split(/\r?\n/);
      const index=lines.findIndex(line=>line.includes('-->'));
      if(index<0)return null;
      const [start,end]=lines[index].split('-->').map(part=>stamp(part.trim().split(/\s+/)[0]));
      if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return null;
      return {start,end,text:lines.slice(index+1).join('\n').trim()};
    }).filter(Boolean);
  }
  function sourcesFor(model,userSources,conceptId) {
    const ids=new Set(model.conceptSources.filter(link=>link.conceptId===conceptId).map(link=>link.sourceId));
    return [...model.sources,...(userSources||[])].filter(source=>ids.has(source.id)||
      source.conceptIds?.includes(conceptId));
  }
  const driveAdapter={configured:false,async connect(){throw new Error('drive_oauth_not_configured');},
    async list(){return [];}};
  window.NexoSources={categories,validate,parseTranscript,sourcesFor,driveAdapter};
})();
