create table if not exists public.formula_subjects (
  id text primary key,
  name text not null,
  slug text not null,
  exam text not null check (exam in ('JEE', 'NEET')),
  sort_order integer not null default 0,
  unique (exam, slug)
);

create table if not exists public.formula_chapters (
  id text primary key,
  subject_id text not null references public.formula_subjects(id) on delete cascade,
  title text not null,
  slug text not null,
  sort_order integer not null default 0,
  unique (subject_id, slug)
);

create table if not exists public.formula_cards (
  id text primary key,
  chapter_id text not null references public.formula_chapters(id) on delete cascade,
  title text not null,
  card_type text not null check (card_type in ('formula', 'concept', 'table', 'diagram', 'note', 'mixed')),
  body text,
  formulas jsonb not null default '[]'::jsonb,
  variables jsonb not null default '[]'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  table_data jsonb,
  diagram_data jsonb,
  diagram_svg text,
  importance integer not null default 3 check (importance between 1 and 5),
  source_page integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists formula_subjects_exam_sort_idx on public.formula_subjects (exam, sort_order);
create index if not exists formula_chapters_subject_sort_idx on public.formula_chapters (subject_id, sort_order);
create index if not exists formula_cards_chapter_active_sort_idx on public.formula_cards (chapter_id, is_active, sort_order);

insert into public.formula_subjects (id, name, slug, exam, sort_order) values
  ('jee-physics', 'Physics', 'physics', 'JEE', 1),
  ('jee-chemistry', 'Chemistry', 'chemistry', 'JEE', 2),
  ('jee-mathematics', 'Mathematics', 'mathematics', 'JEE', 3),
  ('neet-physics', 'Physics', 'physics', 'NEET', 1),
  ('neet-chemistry', 'Chemistry', 'chemistry', 'NEET', 2),
  ('neet-biology', 'Biology', 'biology', 'NEET', 3)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  exam = excluded.exam,
  sort_order = excluded.sort_order;

insert into public.formula_chapters (id, subject_id, title, slug, sort_order) values
  ('jee-physics-unit-and-dimensions', 'jee-physics', 'Unit and Dimensions', 'unit-and-dimensions', 1),
  ('jee-physics-rectilinear-motion', 'jee-physics', 'Rectilinear Motion', 'rectilinear-motion', 2),
  ('neet-physics-unit-and-dimensions', 'neet-physics', 'Unit and Dimensions', 'unit-and-dimensions', 1),
  ('neet-physics-rectilinear-motion', 'neet-physics', 'Rectilinear Motion', 'rectilinear-motion', 2)
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

insert into public.formula_cards
  (id, chapter_id, title, card_type, body, formulas, variables, conditions, table_data, diagram_data, importance, source_page, sort_order)
values
  (
    'jee-physics-unit-and-dimensions-unit-definition',
    'jee-physics-unit-and-dimensions',
    'Unit',
    'concept',
    'Measurement of a physical quantity is expressed in terms of an internationally accepted basic standard called a unit.',
    '[]',
    '[]',
    '["Source: Physics Formula Handbook, Unit and Dimensions."]',
    null,
    null,
    3,
    2,
    1
  ),
  (
    'jee-physics-unit-and-dimensions-fundamental-units',
    'jee-physics-unit-and-dimensions',
    'Fundamental SI Units',
    'table',
    'The handbook lists seven fundamental physical quantities and their SI units.',
    '[]',
    '[]',
    '[]',
    '{"columns":["Physical quantity","SI unit","Symbol"],"rows":[["Length","Metre","m"],["Mass","Kilogram","kg"],["Time","Second","s"],["Electric current","Ampere","A"],["Temperature","Kelvin","K"],["Luminous intensity","Candela","cd"],["Amount of substance","Mole","mol"]]}'::jsonb,
    null,
    5,
    2,
    2
  ),
  (
    'jee-physics-unit-and-dimensions-supplementary-units-prefixes',
    'jee-physics-unit-and-dimensions',
    'Supplementary Units & Metric Prefixes',
    'table',
    'Plane angle and solid angle are listed as supplementary units, followed by common metric prefixes.',
    '[]',
    '[]',
    '[]',
    '{"sections":[{"title":"Supplementary units","columns":["Physical quantity","SI unit","Symbol"],"rows":[["Plane angle","Radian","r"],["Solid angle","Steradian","sr"]]},{"title":"Metric prefixes","columns":["Prefix","Symbol","Value"],"rows":[["Centi","c","$10^{-2}$"],["Milli","m","$10^{-3}$"],["Micro","$\\mu$","$10^{-6}$"],["Nano","n","$10^{-9}$"],["Pico","p","$10^{-12}$"],["Kilo","K","$10^{3}$"],["Mega","M","$10^{6}$"]]}]}'::jsonb,
    null,
    4,
    2,
    3
  ),
  (
    'jee-physics-rectilinear-motion-average-velocity-speed',
    'jee-physics-rectilinear-motion',
    'Average Velocity & Average Speed',
    'formula',
    'Average velocity uses total displacement over total time. Average speed uses total distance travelled over total time.',
    '[{"label":"Average velocity","latex":"\\vec v_{av}=\\bar v=\\langle v\\rangle=\\frac{\\vec r_f-\\vec r_i}{\\Delta t}"},{"label":"Average speed","latex":"\\text{Average speed}=\\frac{\\text{Total distance travelled}}{\\text{Total time taken}}"}]'::jsonb,
    '[{"latex":"\\vec r_i","symbol":"$\\vec r_i$","meaning":"initial position"},{"latex":"\\vec r_f","symbol":"$\\vec r_f$","meaning":"final position"},{"latex":"\\Delta t","symbol":"$\\Delta t$","meaning":"time interval"}]'::jsonb,
    '["Velocity depends on displacement; speed depends on distance travelled."]'::jsonb,
    null,
    null,
    5,
    3,
    1
  ),
  (
    'jee-physics-rectilinear-motion-instantaneous-velocity',
    'jee-physics-rectilinear-motion',
    'Instantaneous Velocity',
    'formula',
    'Instantaneous velocity is the limiting value of displacement per time interval as the interval becomes very small.',
    '[{"label":"Instantaneous velocity","latex":"\\vec v_{inst}=\\lim_{\\Delta t\\to 0}\\left(\\frac{\\Delta \\vec r}{\\Delta t}\\right)"}]'::jsonb,
    '[{"latex":"\\Delta \\vec r","symbol":"$\\Delta \\vec r$","meaning":"small displacement in time $\\Delta t$"}]'::jsonb,
    '[]',
    null,
    null,
    5,
    3,
    2
  ),
  (
    'jee-physics-rectilinear-motion-acceleration',
    'jee-physics-rectilinear-motion',
    'Average & Instantaneous Acceleration',
    'formula',
    'Average acceleration compares the change in velocity over a time interval. Instantaneous acceleration is the limiting value at an instant.',
    '[{"label":"Average acceleration","latex":"\\vec a_{av}=\\frac{\\Delta \\vec v}{\\Delta t}=\\frac{\\vec v_f-\\vec v_i}{\\Delta t}"},{"label":"Instantaneous acceleration","latex":"\\vec a=\\frac{d\\vec v}{dt}=\\lim_{\\Delta t\\to 0}\\left(\\frac{\\Delta \\vec v}{\\Delta t}\\right)"}]'::jsonb,
    '[{"latex":"\\vec v_i","symbol":"$\\vec v_i$","meaning":"initial velocity"},{"latex":"\\vec v_f","symbol":"$\\vec v_f$","meaning":"final velocity"}]'::jsonb,
    '[]',
    null,
    null,
    5,
    3,
    3
  ),
  (
    'jee-physics-rectilinear-motion-x-t-graph',
    'jee-physics-rectilinear-motion',
    'Position-Time Graph',
    'diagram',
    'For uniformly accelerated motion with non-zero acceleration, position is a quadratic polynomial in time, so the x-t graph is a parabola.',
    '[{"label":"Graph fact","latex":"x\\text{ is quadratic in }t\\Rightarrow x\\text{-}t\\text{ graph is a parabola}"}]'::jsonb,
    '[]',
    '["The handbook shows opposite curvatures for positive and negative acceleration."]'::jsonb,
    null,
    '{"type":"xt"}'::jsonb,
    4,
    3,
    4
  ),
  (
    'jee-physics-rectilinear-motion-v-t-graph',
    'jee-physics-rectilinear-motion',
    'Velocity-Time Graph',
    'diagram',
    'For uniformly accelerated motion, velocity is a linear polynomial in time, so the v-t graph is a straight line with slope a.',
    '[{"label":"Slope","latex":"\\text{slope}=a"}]'::jsonb,
    '[{"latex":"u","symbol":"$u$","meaning":"initial velocity on the v-axis"}]'::jsonb,
    '["Positive acceleration gives positive slope; negative acceleration gives negative slope."]'::jsonb,
    null,
    '{"type":"vt"}'::jsonb,
    4,
    3,
    5
  ),
  (
    'jee-physics-rectilinear-motion-a-t-graph',
    'jee-physics-rectilinear-motion',
    'Acceleration-Time Graph',
    'diagram',
    'In uniformly accelerated motion, acceleration is constant, so the a-t graph is a horizontal line.',
    '[{"label":"Constant acceleration","latex":"a=\\text{constant}"}]'::jsonb,
    '[]',
    '["The handbook shows separate horizontal lines for positive and negative acceleration."]'::jsonb,
    null,
    '{"type":"at"}'::jsonb,
    4,
    4,
    6
  ),
  (
    'jee-physics-rectilinear-motion-maxima-minima',
    'jee-physics-rectilinear-motion',
    'Maxima & Minima',
    'formula',
    'The handbook states derivative tests for locating maximum and minimum points.',
    '[{"label":"Maximum","latex":"\\frac{dy}{dx}=0\\ \\text{and}\\ \\frac{d}{dx}\\left(\\frac{dy}{dx}\\right)<0"},{"label":"Minimum","latex":"\\frac{dy}{dx}=0\\ \\text{and}\\ \\frac{d}{dx}\\left(\\frac{dy}{dx}\\right)>0"}]'::jsonb,
    '[]',
    '[]',
    null,
    null,
    3,
    4,
    7
  ),
  (
    'jee-physics-rectilinear-motion-equations-of-motion',
    'jee-physics-rectilinear-motion',
    'Equations of Motion',
    'mixed',
    'These equations are for motion with constant acceleration.',
    '[{"latex":"v=u+at"},{"latex":"s=ut+\\frac{1}{2}at^2"},{"latex":"s=vt-\\frac{1}{2}at^2"},{"latex":"x_f=x_i+ut+\\frac{1}{2}at^2"},{"latex":"v^2=u^2+2as"},{"latex":"s=\\frac{u+v}{2}t"},{"latex":"s_n=u+\\frac{a}{2}(2n-1)"}]'::jsonb,
    '[{"latex":"u","symbol":"$u$","meaning":"initial velocity"},{"latex":"v","symbol":"$v$","meaning":"final velocity"},{"latex":"a","symbol":"$a$","meaning":"constant acceleration"},{"latex":"s","symbol":"$s$","meaning":"displacement"}]'::jsonb,
    '["Use for constant acceleration only."]'::jsonb,
    null,
    null,
    5,
    4,
    8
  ),
  (
    'jee-physics-rectilinear-motion-free-fall',
    'jee-physics-rectilinear-motion',
    'Freely Falling Bodies',
    'mixed',
    'For freely falling bodies, the handbook uses u = 0 and takes upward direction as positive.',
    '[{"latex":"v=-gt"},{"latex":"s=-\\frac{1}{2}gt^2"},{"latex":"s=vt+\\frac{1}{2}gt^2"},{"latex":"h_f=h_i-\\frac{1}{2}gt^2"},{"latex":"v^2=-2gs"},{"latex":"s_n=-\\frac{g}{2}(2n-1)"}]'::jsonb,
    '[{"latex":"g","symbol":"$g$","meaning":"acceleration due to gravity"}]'::jsonb,
    '["$u=0$","Upward direction is taken as positive."]'::jsonb,
    null,
    null,
    5,
    4,
    9
  )
on conflict (id) do update set
  title = excluded.title,
  card_type = excluded.card_type,
  body = excluded.body,
  formulas = excluded.formulas,
  variables = excluded.variables,
  conditions = excluded.conditions,
  table_data = excluded.table_data,
  diagram_data = excluded.diagram_data,
  diagram_svg = excluded.diagram_svg,
  importance = excluded.importance,
  source_page = excluded.source_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.formula_cards
  (id, chapter_id, title, card_type, body, formulas, variables, conditions, table_data, diagram_data, diagram_svg, importance, source_page, sort_order, is_active)
select
  replace(id, 'jee-', 'neet-'),
  replace(chapter_id, 'jee-', 'neet-'),
  title,
  card_type,
  body,
  formulas,
  variables,
  conditions,
  table_data,
  diagram_data,
  diagram_svg,
  importance,
  source_page,
  sort_order,
  is_active
from public.formula_cards
where chapter_id in ('jee-physics-unit-and-dimensions', 'jee-physics-rectilinear-motion')
on conflict (id) do update set
  title = excluded.title,
  card_type = excluded.card_type,
  body = excluded.body,
  formulas = excluded.formulas,
  variables = excluded.variables,
  conditions = excluded.conditions,
  table_data = excluded.table_data,
  diagram_data = excluded.diagram_data,
  diagram_svg = excluded.diagram_svg,
  importance = excluded.importance,
  source_page = excluded.source_page,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
