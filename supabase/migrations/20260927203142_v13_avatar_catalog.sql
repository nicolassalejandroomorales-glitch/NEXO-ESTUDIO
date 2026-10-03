-- V13 catalogue metadata. IDs of existing purchases deliberately stay stable.
alter table public.cosmetics add column description text not null default '';
alter table public.cosmetics add column slot text;
alter table public.cosmetics add column rarity text not null default 'common'
  check (rarity in ('common','uncommon','rare','epic','legendary'));
alter table public.cosmetics add column compatible_species text[] not null default array['*'];
alter table public.cosmetics add column asset_key text not null default '';
alter table public.cosmetics add column metadata jsonb not null default '{}'::jsonb;
alter table public.cosmetics add column featured boolean not null default false;
alter table public.cosmetics add column available_from timestamptz;
alter table public.cosmetics add column available_until timestamptz;
update public.cosmetics set slot=case kind when 'hat' then 'head' when 'bag' then 'back'
  when 'scene' then 'background' when 'undefined' then 'species'
  when 'feature' then 'feature' else kind end,
  rarity=case when price>=350 then 'epic' when price>=180 then 'rare'
    when price>=90 then 'uncommon' else 'common' end,
  compatible_species=case when kind in ('hat','bag','shirt','tail')
    then array['pig','cat','dog'] else array['*'] end,
  asset_key=cosmetic_id;
alter table public.cosmetics alter column slot set not null;
alter table public.cosmetics add constraint cosmetic_slot_valid
  check (slot in ('species','head','face','shirt','back','tail','aura','background','feature'));

update public.cosmetics set name=v.name,asset_key='vector:'||public.cosmetics.cosmetic_id
from (values
  ('shirt-barca','Túnica de resonancia'),('shirt-real','Guardapolvo cristalino'),
  ('shirt-udechile','Capa de análisis'),('shirt-colocolo','Uniforme de entropía'),
  ('hat-asta-band','Banda del catalizador'),('hat-golden-circlet','Aro de la aurora'),
  ('hat-bulls-hood','Capucha de observatorio'),('bag-grimoire','Morral de fórmulas'),
  ('bag-bulls-mission','Mochila de expedición'),('bag-golden-wind','Mochila de resonancia'),
  ('tail-antimagic','Estela de vacío'),('tail-wind-spirit','Estela de brisa'),
  ('tail-salamander','Estela de magma')
) as v(cosmetic_id,name) where public.cosmetics.cosmetic_id=v.cosmetic_id;
update public.cosmetics set kind='species' where slot='species';
update public.cosmetics set kind='background' where slot='background';

insert into public.cosmetics(cosmetic_id,name,description,kind,slot,rarity,price,
  compatible_species,asset_key,featured) values
('face-lens','Lente de espectro','Observa patrones invisibles entre cada intento.',
 'face','face','rare',140,array['*'],'vector:face-lens',true),
('aura-resonance','Aura de resonancia','Una órbita suave que acompaña al estudio.',
 'aura','aura','epic',310,array['*'],'vector:aura-resonance',true),
('scene-archive','Archivo astral','Un refugio para ideas en construcción.',
 'background','background','rare',190,array['*'],'scene:archive',true)
on conflict(cosmetic_id) do nothing;

-- Every path that writes the mascot document (RPC and direct table access) must
-- respect inventory, category and species. A client cannot forge an equipped item.
create or replace function public.validate_avatar_document() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_mascot jsonb; v_species text; v_slot text; v_item text;
begin
  if new.kind<>'mascot' or new.data @> '{"_deleted":true}'::jsonb then return new; end if;
  v_mascot:=new.data->'value';
  if jsonb_typeof(v_mascot)<>'object' then raise exception 'invalid_avatar'; end if;
  v_species:=coalesce(v_mascot->>'species','pig');
  if not exists(select 1 from public.user_inventory where user_id=new.user_id
    and cosmetic_id='species-'||v_species) then raise exception 'species_not_owned'; end if;
  for v_slot,v_item in select key,value from jsonb_each_text(coalesce(v_mascot->'slots','{}'::jsonb)) loop
    if v_item is null then continue; end if;
    if v_slot not in ('head','face','shirt','back','tail','aura','background')
      or not exists(select 1 from public.user_inventory i join public.cosmetics c
        on c.cosmetic_id=i.cosmetic_id where i.user_id=new.user_id and i.cosmetic_id=v_item
        and c.slot=v_slot and (array['*']::text[] && c.compatible_species
          or v_species=any(c.compatible_species)))
    then raise exception 'item_not_owned'; end if;
  end loop;
  -- V11/V12 aliases are still readable during migration; validate those too.
  for v_slot,v_item in select x.slot,v_mascot->>x.alias from (values
    ('head','hat'),('back','bag'),('shirt','shirt'),('tail','tail'),('background','scene')
  ) x(slot,alias) loop
    if v_item is null then continue; end if;
    if not exists(select 1 from public.user_inventory i join public.cosmetics c
      on c.cosmetic_id=i.cosmetic_id where i.user_id=new.user_id and i.cosmetic_id=v_item
      and c.slot=v_slot) then raise exception 'item_not_owned'; end if;
  end loop;
  return new;
end $$;
create trigger nexo_validate_avatar before insert or update on public.user_documents
for each row execute function public.validate_avatar_document();
