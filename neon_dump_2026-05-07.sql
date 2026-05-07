--
-- PostgreSQL database dump
--

\restrict nGU9Qnoj2lyjGUXEmU7GDjJPoDgsiFNkZwwOv6AIb8ewgSPSgEwrAbdEaB1TqwL

-- Dumped from database version 17.8 (ad62774)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: neon_auth; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA neon_auth;


ALTER SCHEMA neon_auth OWNER TO neondb_owner;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users_sync; Type: TABLE; Schema: neon_auth; Owner: neondb_owner
--

CREATE TABLE neon_auth.users_sync (
    raw_json jsonb NOT NULL,
    id text GENERATED ALWAYS AS ((raw_json ->> 'id'::text)) STORED NOT NULL,
    name text GENERATED ALWAYS AS ((raw_json ->> 'display_name'::text)) STORED,
    email text GENERATED ALWAYS AS ((raw_json ->> 'primary_email'::text)) STORED,
    created_at timestamp with time zone GENERATED ALWAYS AS (to_timestamp((trunc((((raw_json ->> 'signed_up_at_millis'::text))::bigint)::double precision) / (1000)::double precision))) STORED,
    updated_at timestamp with time zone,
    deleted_at timestamp with time zone
);


ALTER TABLE neon_auth.users_sync OWNER TO neondb_owner;

--
-- Name: commentaries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.commentaries (
    id text NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    metadata jsonb,
    "isDisplayed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "displayedAt" timestamp(3) without time zone
);


ALTER TABLE public.commentaries OWNER TO neondb_owner;

--
-- Name: drink_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.drink_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    "drinkType" text NOT NULL,
    points integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.drink_logs OWNER TO neondb_owner;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.posts (
    id text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    image_url text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.posts OWNER TO neondb_owner;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teams (
    id text NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    logo_image_url text
);


ALTER TABLE public.teams OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    "teamId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    profile_image_url text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: users_sync; Type: TABLE DATA; Schema: neon_auth; Owner: neondb_owner
--

COPY neon_auth.users_sync (raw_json, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: commentaries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.commentaries (id, type, message, priority, metadata, "isDisplayed", "createdAt", "displayedAt") FROM stdin;
cmfr4ra7g0002l504qut1r353	last_place_change	Urosh se ni ustrašil in ostaja v igri! 💪🍻 Tajsss je morda padel na zadnje mesto, a to je priložnost za nov zagon – pokažimo mu, da še ni konec!	2	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY"]}	f	2025-09-19 17:45:23.002	\N
cmfr4ujhi0004jm043kfto8c5	last_place_change	Tajsss je pokazal pravi športni duh in s svojim izjemnim napredkom zapustil zadnje mesto! 💪⬆️ Zdaj se ponaša z 2 točkama in je na zmagovalni poti, bravo! 🎉🍻	2	{"userId": "cmfr34sa90000ib04lr2ohjjz", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ESCAPE"]}	f	2025-09-19 17:47:54.737	\N
cmfr4wl5o0006jm049glx9gb4	hype	In to je trenutek, ki ga vsi čakamo! Jens iz SAŠA UDOVIČ WANNABE se pripravlja na svoj naslednji požirek žganja! Z 2 pijačama in 3 točkami na svojem računu, akcija se šele začenja! 💥 Čaka nas ogromen trenutek, saj vsaka kapljica šteje! 🥃🔥 Dajmo mu vso podporo!	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4kxns0000l4041hif9ufo", "trigger": "test_always"}	f	2025-09-19 17:49:30.688	\N
cmfr515pp0009jm04ffwfjvmj	achievement	In že imamo zgodovinski trenutek! 🎉 PaX je pravkar osvojil svojo prvo pijačo za SAŠA UDOVIČ WANNABE in s tem dodal pomembno točko ekipi! 🥳🔥 S tem žganjem smo na pravi poti do zmagoslavja! 🍹🥇	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "achievement": "first_drink"}	f	2025-09-19 17:53:03.953	\N
cmfr52d6z000bjm04cbwtp2oj	hype	In to je to, dragi gledalci! 🥳 Naši tekmovalci se resnično potijo za vsak požirek! PaX je z eno točko na svojem nizu in zdaj se pripravlja na dvig energij s tistim žganjem! 🔥 SAŠA UDOVIČ WANNABE s 8 točkami in 5 izjemnimi člani na čelu, bo to dvoboj, ki ga	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "trigger": "test_always"}	f	2025-09-19 17:53:59.838	\N
cmfr536hk000ejm04cqxmiso3	top_3_change	Incredible! Krix je s spektakularnim skokom z 5. na 2. mesto v globalnem rangu zaslužil mesto na stopničkah! 🥈 S to nevjerojatno predstavo in žganjem v roki se je prebil med najboljše, medtem ko je Bwsk, žal, zdrsnil na dno! ⬇️	4	{"userId": "cmfr4z6u10004l504udjouaxy", "changes": 3, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "LAST_PLACE_ENTRY", "RANK_JUMP"]}	f	2025-09-19 17:54:38.198	\N
cmfr575x8000jjm0405l4mc93	top_3_change	Neverjetno! Bwsk je s svojim izjemnim skokom iz 6. na 2. mesto 🥈 dosegel noro preobrat in zapustil dno lestvice! Medtem pa je paX z nezavidljivo predstavo padel na zadnje mesto 🥉 - tekma je še naprej napeta!	4	{"userId": "cmfr4wl5n0005jm04hv4w4epc", "changes": 5, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "LAST_PLACE_ESCAPE", "LAST_PLACE_ENTRY", "RANK_JUMP", "RANK_JUMP"]}	f	2025-09-19 17:57:43.679	\N
cmfr59q3o000rjm040c5e5v8y	leadership_change	🏆 OOOOOH, KRIXX je prevzel vodstvo! S svojo žganje pijačo se je dvignil na 4 točke in postal novi globalni vladar, saj je prehitel Jensa za eno samo točko! 👑 Razlike so majhne, a napetost je ogromna!	5	{"userId": "cmfr4z6u10004l504udjouaxy", "changes": 4, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN", "TOP_3_EXIT", "TOP_3_EXIT", "TOP_3_EXIT"]}	f	2025-09-19 17:59:43.507	\N
cmfr5byh20007l504yes7lxic	top_3_change	Incredibilno! Urosh je s svojim odločnim korakom na žganju v trenutku skočil na 2. mesto! 🥈 Zdaj se le še spogleduje s prvo stopničko - bo to njegov dan?	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 18:01:27.786	\N
cmfr5csye000cl504qe7pbl9z	leadership_change	Incredibilno! 👑🏆 NOVI VLADAR je na sceni! Jens z neverjetnim žganjem (+1 točk) prehiteva Krix in s skupnimi 4 točkami prevzema vodstvo – prestol je padel! Razlika: 0 točk!	5	{"userId": "cmfr4kxns0000l4041hif9ufo", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN"]}	f	2025-09-19 18:02:07.382	\N
cmfr5da7f000dl504vo81g9vw	top_3_change	In to je to, dragi gledalci! 🥉 Bwsk je s svojim žganjem prvikrat prebil led in z neverjetnim napredkom vstopil na 3. mesto, kar pomeni, da je prava bitka za stopničke šele zdaj začela!🔥 Kdo bo naslednji, ki se bo pridružil tej napeti dirki?	4	{"userId": "cmfr4wl5n0005jm04hv4w4epc", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 18:02:29.648	\N
cmfr5dbsz000ujm046avzumul	leadership_change	Incredible! 🎉🏆 Bwsk je s svojo izjemno potezo za žganje prevzel vodstvo in prestol je padel! 👑 S skupno točko 4 je prehitel Jens-a, razlika je zdaj 0 točk – to je pravi kaos na terenu! 🔥💪	5	{"userId": "cmfr4wl5n0005jm04hv4w4epc", "changes": 4, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN", "TEAM_LEADERSHIP", "TOP_3_EXIT", "TOP_3_EXIT"]}	f	2025-09-19 18:02:31.657	\N
cmfr5dei2000gl504q8r0upsh	last_place_change	Bravo, Katharina! 💪⬆️ S svojim izjemnim nastopom in žganjem si zablestela in zapustila zadnje mesto, kar je prava zmaga! Nadaljuj v tem duhu! 🍻🥳	2	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ESCAPE"]}	f	2025-09-19 18:02:35.306	\N
cmfr5dspy000jl504o4wvd5t2	leadership_change	Kje so tisti, ki so dvomili?! 🏆 Katharina je z magičnim žganjem (+3 točke) prevzel kronski prestol in postavil nov globalni rekord z 5 točkami, prehitevši Bwsk za en sam toček! 👑 Ekipno vodstvo Sasa žene je prav tako v njenem naročju, saj je Krix ostal v prahu za njo! 🔥🥳	5	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 5, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN", "TEAM_LEADERSHIP", "TOP_3_ENTRY", "LAST_PLACE_ENTRY", "RANK_JUMP"]}	f	2025-09-19 18:02:53.643	\N
cmfr5h1iz000ol504wb9du157	last_place_change	In čestitke Tajsss! 💪⬆️ Počasi, a vztrajno se je izkopal iz zadnjega mesta in zdaj zaseda odlično 5. mesto! Poglejte ga, kako se vihti z žganjem! 🎉🍻	2	{"userId": "cmfr34sa90000ib04lr2ohjjz", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ESCAPE"]}	f	2025-09-19 18:05:25.024	\N
cmfr5h1j0000pl504fl8xghr0	streak	🔥 Katharina je v neverjetnem ritmu! S tremi kozarci žganja naenkrat šiba proti zmagi, saj ji vsaka pijača prinaša še več energije! 🥳💪	3	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr59jlr000qjm04rjfba2vx", "drinkType": "MOSCOW_MULE", "streakCount": 3}	f	2025-09-19 18:05:25.024	\N
cmfr621ig0004le04ru9clruy	top_3_change	Incredibilno! 🎉 Urosh s svojo odločnostjo in žganjem preskočuje na tretje mesto 🥉 in s tem vznemirljivo vstopa v TOP 3! Je to novi zmagovalec, ki se bo boril za zlato? 🥇	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 18:21:44.306	\N
cmfr6yaey000li104463ae39c	rank_jump	🚀 Vau! Anej je naredil neverjeten skok s 15. na 10. mesto v globalnem rangu! 📈 Kljub začetnim težavam je s svojo trenutna pijačo, žganjem, pokazal, da se nikoli ne smeš predati! 🍻✨	2	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:46:49.311	\N
cmfr623lp0005le04bjrz3uda	top_3_change	Incredibilno! Urosh je na čelu s svojo žganje pijačo in že pridobiva točke, medtem ko sta Bwsk in Krix zapustila TOP 3 in padla na 4. mesto! 🥇🥈🥉 Kdo bo prevzel vodstvo v tej napeti bitki za pokal Šanka?	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_EXIT", "TOP_3_EXIT"]}	f	2025-09-19 18:21:47.581	\N
cmfr64idh0002l504hx7cvmpk	hype	In to je to, dragi gledalci! 🎉 Igralec paX se bo sedaj podal na osvajanje dodatne točke s svojo trenutno pijačo - žganjem! 🔥 S skupno 4 točkami v ekipi SAŠA UDOVIČ WANNABE, ki že blesti s 22 točkami, nas čaka prava poslastica! Kdo bo izstrelil to zmago? Pogle	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "trigger": "test_always"}	f	2025-09-19 18:23:39.945	\N
cmfr68r680004l204066u5onn	team_leadership	Incredible preobrat! 👑 NOVO EKIPNO VODSTVO v Smokeye: Larson (3) je prehitel Gomby (0)! 🏟️ Razlika: 3 točk, to je prava ekipa, ki se bori za zmago! 🍻🚀	4	{"userId": "cmfr66rlb0006le04agnslczw", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 18:26:57.502	\N
cmfr69mvk0002i104fji8wfj9	last_place_change	In neverjeten preobrat, Gomby se je znašel na zadnjem mestu! 💪🍻 Ampak ne obupaj, prijatelj, še vedno je čas za povratek – dvigni kozarec in pokaži, da si pravi borec!	2	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY"]}	f	2025-09-19 18:27:39.153	\N
cmfr6e63m0002ie04ihpxmu8c	last_place_change	🎉 Bravo, Gomby! S svojim vrhunskim nastopom in odličnim žganjem si se dvignil na 9. mesto! 💪⬆️ \n\nAmpak ne pozabi, Anej! Vsaka pijača šteje, in zdaj je pravi trenutek, da se vrneš v igro! 💪🍻	2	{"userId": "cmfr64pg10003l504bd6clu0s", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ESCAPE", "LAST_PLACE_ENTRY"]}	f	2025-09-19 18:31:10.293	\N
cmfr6ix190004ik04rk8sjra2	top_3_change	Incredible! 🥉 paX se je s svojo izjemno potezo odločil za žganje in zdaj zaseda 3. mesto, podaljšal je boj za stopničke! Kdo bo naslednji, ki se bo pridružil v tej razburljivi dirki?	4	{"userId": "cmfr4xnlr0003l504mnluk06k", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 18:34:52.221	\N
cmfr6j1xr0006ik04pyqppkz5	team_leadership	🎉🏟️ Pozor, pozor! Ekipa Smokeye je doživela preobrat, saj je Kicho z neverjetnim žganjem (+2 točk) prevzel vajeti vodstva z 4 točkami! 👑 Z le točko prednosti pred Larsonom se obetajo napeti trenutki in nepozabni obračuni! 🔥🍻	4	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "RANK_JUMP"]}	f	2025-09-19 18:34:58.575	\N
cmfr6o67s0008l1041rbld4s2	team_leadership	Incredible! 👑 NOVO EKIPNO VODSTVO v Kras united: Mrax (2) je s svojim žganjem (+2 točk) prehitel Davora (0), in s tem postavil nov standard za ekipo! 🏟️ To je trenutek, ko se ekipa prebuja in prevzema nadzor!	4	{"userId": "cmfr6ksyb0000ky04l2z69bak", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 18:38:56.836	\N
cmfr6obf60009l1047e1ql5sx	top_3_change	🥉 Vstop Kicha na 3. mesto je prava senzacija! S svojim žganjem je prehitel paXa in Urosha, ki sta se morala zadovoljiti z 4. mestom - napetosti na vrhu nikoli ni bilo več! 🎉🍹	4	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 3, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "TOP_3_EXIT", "TOP_3_EXIT"]}	f	2025-09-19 18:39:04.054	\N
cmfr6opou000cl104utexel6k	rank_jump	🚀 Tajsss je pravkar razstrelil konkurenco in z neverjetnim skokom z 8. na 4. mesto ter nato še z 5. na 2. mesto prekaša vse nasprotnike! 📈 Ta impresiven napredek z žganjem v roki dokazuje, da je pripravljen na vse - kdo ga lahko ustavi? 🥳🏆	2	{"userId": "cmfr34sa90000ib04lr2ohjjz", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP", "RANK_JUMP"]}	f	2025-09-19 18:39:22.546	\N
cmfr6p8yd000fl104nvqgxce5	team_leadership	🏟️💥 In to je to! Davor je prevzel krmilo v Kras united, saj je s svojo izbiro žganja preskočil Mraxa in postal novi vodja ekipe! 👑 Z enakim številom točk, a z neustavljivo energijo, ta trenutek obeta še več napetosti in izzivov!	4	{"userId": "cmfr6k8bp0009i104v5au9ifv", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "RANK_JUMP"]}	f	2025-09-19 18:39:47.514	\N
cmfr6py13000il104ql4e8pn4	top_3_change	Wow, kaj se dogaja na "Pokal Šanka"! 🎉 paX je s svojim odličnim nastopom z žganjem preskočil na 2. mesto 🥈 in prevzel pobudo, medtem ko je Kicho nepričakovano padel na 4. mesto! 👏 Smo priča epskemu boju za stopničke! 🥇🥉	4	{"userId": "cmfr4xnlr0003l504mnluk06k", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "TOP_3_EXIT"]}	f	2025-09-19 18:40:20.011	\N
cmfr6q4cd000ll1048lue5sho	leadership_change	🔊 In tukaj ga imamo, dragi gledalci! 🏆 NOVO GLOBALNO VODSTVO: paX (9) je prevzel prestol in s tem prehitel Katharina (8) za neverjetno razliko le 1 točke! 👑 Ne le to, tudi v SAŠA UDOVIČ WANNABE je prestol padel, saj je paX (9) izbrisal Jens (7) in prevzel	5	{"userId": "cmfr4xnlr0003l504mnluk06k", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN", "TEAM_LEADERSHIP"]}	f	2025-09-19 18:40:28.286	\N
cmfr6rafn000ol1041ajt3xlb	leadership_change	🎉🏆 PRESTOL JE PADEL! Novi vladar pitja, Katharina, s spektakularnim žganjem (+2 točki) prevzema vodstvo s 10 točkami! PaX se mora zadovoljiti s 9 točkami, razlika je le 1 točka! 👑🥳	5	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN"]}	f	2025-09-19 18:41:22.835	\N
cmfr6ul2v000aik04lkyua3g2	rank_jump	🚀 UAU! Optimus prime je dosegel neverjeten velik skok s 14. na 10. mesto v globalnem rangu! 📈 Kljub temu, da še ni osvojil točk, je njegova odločnost ob žganju nedvomno presenetila vse prisotne!	2	{"userId": "cmfr6kcxd000ai1045l249snz", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:43:56.599	\N
cmfr6vy18000dik049tvp01m3	rank_jump	🚀 VELIK SKOK! Kras united je preskočil z 15. na 10. mesto in nato še z 4. na 1. mesto globalnega ranga! 📈 Njihova odločitev za žganje je obrodila sadove - to je resnično eksploziven napredek! 🍹🔥	2	{"userId": "cmfr6m6c90007ik04qfs8z3b2", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP", "RANK_JUMP"]}	f	2025-09-19 18:44:59.953	\N
cmfr6w5vr000gik04g99o8hzg	last_place_change	In tako, dragi navijači, naš Lozo se je znašel na zadnjem mestu, a ne obupajmo! 💪🍻 S tem žganjem bo zagotovo dvignil formo in se vrnil v igro!	2	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY"]}	f	2025-09-19 18:45:10.216	\N
cmfr6vaqp000ei10442rddqjz	consolidated_bulk	🔥🏁 NEVERJETEN SPEKTAKEL se odvija na Pokalu Šanka! Tajsss sredi POPOLNEGA KAOSA prehiteva nasprotnike in se vzpenja na ZGODOVINSKO 3. mesto – iz 5. mesta se dviga s hitrostjo rakete! 🚀🍻 Ekipe SAŠA UDOVIČ WANNABE dodajajo še 2 točki, ko žganje	4	{"teams": ["SAŠA UDOVIČ WANNABE"], "changes": 1, "trigger": "enhanced_bulk", "userIds": ["cmfr34sa90000ib04lr2ohjjz"], "drinkType": "AMARO", "userCount": 1, "changeTypes": ["TOP_3_ENTRY"], "totalPoints": 2}	f	2025-09-19 18:44:29.858	\N
cmfr703ua000ri1047g9vdp7x	team_leadership	🏟️🎉 In danes se dogaja! Davor prevzema krmilo v Kras united! 👑 Z neverjetnim žganjem je izenačil točke z Optimus prime in postavlja ekipno dinamiko na noge! 🥳🍹	4	{"userId": "cmfr6k8bp0009i104v5au9ifv", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 18:48:14.103	\N
cmfr781yq000zi104l7zcylf4	rank_jump	🚀 Uuu, Anej je naredil velik preskok! 📈 Skočil je s 13. na 8. mesto in dodal točke s svojim žganjem, kar pomeni, da je v igri postregel z resnično izjemnim napredkom! Bravo, Anej! 🍻	2	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:54:24.41	\N
cmfr6z0s1000oi104m6procnv	team_leadership	👏🏆 Oooo, kaj se dogaja na igrišču! 👑 NOVO EKIPNO VODSTVO v Kras United prevzema Optimus Prime z 3 točkami, ki je prehitel Davorja z 2! Razlika le 1 točka, tole bo napeta tekma do konca! 🏟️🍹	4	{"userId": "cmfr6kcxd000ai1045l249snz", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 18:47:23.477	\N
cmfr707ic000ui104z5lq9ltp	rank_jump	🚀 Mrax je naredil neverjeten skok iz 12. na 9. mesto v globalnem rangu! 📈 Kdo bi si mislil, da bo žganje tako močno orodje za napredovanje? Čestitke, Mrax! 🍹🥳	2	{"userId": "cmfr6ksyb0000ky04l2z69bak", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:48:18.948	\N
cmfr76ns9000kik04z2erppqb	rank_jump	🚀 Wow, kaj se dogaja! Larson z neverjetnim skokom z 9. na 6. mesto v globalnem rangu, kar je prava senzacija! 📈 Kljub začetnim težavam je uspel prekašati tekmece, ki so ga podcenjevali; to je res presenečenje!	2	{"userId": "cmfr66rlb0006le04agnslczw", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:53:19.883	\N
cmfr787wt0010i104olet4jkp	top_3_change	Incredibilno! 🥉 Kicho je s svojim žganjem in osvojenima 2 točkama preskočil na 3. mesto, medtem ko sta Jens in Tajsss zdrsnila na 4. mesto! To je pravi boj za stopničke v Pokalu Šanka! 🍻💥	4	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 3, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "TOP_3_EXIT", "TOP_3_EXIT"]}	f	2025-09-19 18:54:32.717	\N
cmfr7c6i40006ky048wcn3vgi	rank_jump	🚀 Vau, Elena je naredila neverjeten skok iz 17. na 14. mesto v globalnem rangu! 📈 Kljub začetnim 0 točkam in 0 pijačam, je z žganjem prekašala vse nasprotnike – to je presenečenje, ki ga ne smete zamuditi!	2	{"userId": "cmfr7bh9v000pl104hm0a3n8l", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:57:36.951	\N
cmfr7cbws0007ky04vybjqcgr	rank_jump	🚀 Uuu, kakšen neverjeten skok! Elena je s svojim žganjem z 14. mesta poletela na 6. mesto globalnega ranga! 📈 Vse čestitke, prekašeni ste: vsi, ki ste jo podcenjevali! 🥳	2	{"userId": "cmfr7bh9v000pl104hm0a3n8l", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:57:44.525	\N
cmfr7e1hc0015i104kmm2e6ip	team_leadership	🔥🏟️ Pozor, pozor! 👑 Z novim vodjem Optimus prime (5 točk) je ekipa Kras united prevzela vajeti in prehitela Davorja (3 točke)! Z zmago v pijačnem dvoboju se je veliki Optimus dvignil iz 12. na 6. mesto globalnega ranga! 🎉🥃💪	4	{"userId": "cmfr6kcxd000ai1045l249snz", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "RANK_JUMP"]}	f	2025-09-19 18:59:04.228	\N
cmfr7e5ww0018i104huf2rl86	rank_jump	🚀 Vse čestitke Davorju! Z neverjetnim skokom s 13. na 10. mesto je presenetil vse nas in prekašal številne igralce! 📈🥳	2	{"userId": "cmfr6k8bp0009i104v5au9ifv", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 18:59:10.065	\N
cmfr7f8rt001di104u428nmbu	last_place_change	Inovativno in energično! 🔥 Giulia Lilith je s svojim požirekom žganja naredila velik skok s 18. na 15. mesto! 💪⬆️ Hkrati pa smo priča padcu Kras united, ki se je znašel na dnu lestvice – ne obupajte, fantje, še naprej se borite! 💪🍻	2	{"userId": "cmfr6wigd000hik04bbsyzlg8", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY", "RANK_JUMP"]}	f	2025-09-19 18:59:59.86	\N
cmfr7gnts001gi1044pa0c9ee	hype	In zdaj imamo na sceni Kras United! 🔥 S temi 3 točkami in 2 pijačama so na pravi poti, da uničijo konkurenco! 💪 Z žganjem v roki in 15 točkami v ekipi, boste dosegli zmago, kot še nikoli doslej! Gremo, Kras United! 🏆🥳	2	{"teamId": "cmfr6kpvw000bi104mydir0kt", "userId": "cmfr6m6c90007ik04qfs8z3b2", "trigger": "test_always"}	f	2025-09-19 19:01:06.592	\N
cmfr7gnwd001hi104yevwf42e	leadership_change	In pravkar se je zgodil velik preobrat! 👑🏆 Kicho, novi vladar pitja, s svojim žganjem (+3 točke) prevzema vodstvo s 11 točkami in s tem sledi katarzična zmaga, saj je Katharina (10) zdaj za en sam točko! 🎉🥳	5	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN"]}	f	2025-09-19 19:01:06.593	\N
cmfr7ko8r000rik04phy8gljp	hype	In tu je! Urosh se pripravlja na nov izziv, trenutno s 6 točkami in petimi pijačami! Ekipa SAŠA UDOVIČ WANNABE je v izjemni formi s kar 37 točkami! 🔥🔥 Zdaj pa Urosh poseže po žganju – ali mu bo to prineslo še dodatno točko? Poglejte ga, kako se pripravlja na ta trenutek	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 19:04:13.756	\N
cmfr7kqu1000sik04reesmb5w	hype	In to je Urosh, član ekipe SAŠA UDOVIČ WANNABE, ki se s petimi pijačami in šestimi točkami odvija na vrhu! 🎉 Zdaj je čas, da dvigne svoj kozarec z žganjem in doda še tisto dodatno točko! 🥃🔥 Poglejte ga, kako se pripravlja na naslednji požirek – energija je neustavljiva!	1	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "random_hype"}	f	2025-09-19 19:04:17.113	\N
cmfr7lbiv001ki104h4y2lcfy	hype	In zdaj, dragi gledalci, pozornost na našo zvezdnico Giulio Lilith! 🍹 Z že tremi točkami in dvema popitima pijačama, se pripravlja na dvig adrenalina s to strastno kapljico žganja! 🔥 Ekipa Sasa žene se že drži na vrhu, a Giulia je odločena, da doda še eno točko in poskrbi za vroče vz	2	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr6wigd000hik04bbsyzlg8", "trigger": "test_always"}	f	2025-09-19 19:04:43.835	\N
cmfr7oa6w000vik04pqqfwczo	rank_jump	🚀 Krix je pravkar doživel neverjeten vzpon v rangu, skočil je s 10. na 6. mesto! 📈 Vse čestitke - kljub začetnim težavam je z žganjem pokazal pravo moč in prehitel nekatere velike igralce!	2	{"userId": "cmfr4z6u10004l504udjouaxy", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:07:02.169	\N
cmfr7onc8000sl104czsg3crf	rank_jump	🚀 Vzleteli smo! Elena je s svojim vrhunskim skokom prehitela konkurenco in se povzpela s 8. na 4. mesto v globalnem rangu! 📈 Kdo bi si mislil, da bo žganje prineslo tako neverjeten napredek? Bravo, Elena! 💪🍹	2	{"userId": "cmfr7bh9v000pl104hm0a3n8l", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:07:19.208	\N
cmfr81r6a001si1042c9lpixy	hype	VIK IN VIHAR NADALJUJETA! 🔥 Tajsss s svojim neverjetnim tempom žganja za vse dodaja novi nivo napetosti v "Pokal Šanka"! 🍻 Ekipa SAŠA UDOVIČ WANNABE je v ognju, točke letijo v nebo, to je pravi spektakel, ki ga ne smete zamuditi! 🥳🔥	3	{"teams": ["SAŠA UDOVIČ WANNABE"], "trigger": "bulk_drink", "userIds": ["cmfr34sa90000ib04lr2ohjjz"], "drinkType": "JAGERMEISTER", "userCount": 1, "totalPoints": 2}	f	2025-09-19 19:17:30.706	\N
cmfrd0u5f000klb048dz5wksx	streak	🔥 Urosh se resnično razžiga! 🥃 Z neverjetnim tempom in natančnostjo pobira žganje, vsak požirek ga približuje zmagi – 5 pijač v 30 minutah, to je prava moč! 💪🔥	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "JAGERMEISTER", "streakCount": 5}	f	2025-09-19 21:36:45.896	\N
cmfr7qbov000vl104gdrwsd8b	rank_jump	🚀 Vzletelo je! Lozo je z osvežilnim žganjem naredil neverjeten skok s 18. na 14. mesto 📈 in prekaša številne nasprotnike! Čestitke za energični napredek!	2	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:08:37.423	\N
cmfr815010010ik0461ivinef	milestone	Inštruktor paX pravkar dosega neverjetnih 10 točk! 🎉🥳 Ekipa SAŠA UDOVIČ WANNABE si lahko čestita, saj se z vsakim požirkom približujejo slavi – naprej z žganjem! 🍹💪	2	{"points": 10, "teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "drinkType": "BEER_RADLER"}	f	2025-09-19 19:17:01.392	\N
cmfr81h9j0013ik04c1yoe1wi	hype	In, in, in! 🎉 Naša zvezda paX se je v trenutku odločila za žganje in s tem pridobila še dodatno točko! 🥳 S skupno 10 točkami se zdaj bori s SAŠA UDOVIČ WANNABE, ki so v vodstvu s 39 točkami! Kdo bo zmagal v tem nepozabnem boju? Poglejte, kako se dviga	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "trigger": "test_always"}	f	2025-09-19 19:17:17.77	\N
cmfr81nho001ni1047dtglulh	milestone	In neverjeten preobrat! Anej je s tem žganjem dosegel svoj mejnik 5 točk! 🎉🥳 Ekipa SAŠA UDOVIČ WANNABE se zdaj lahko pohvali s skupno 38 točkami in še vedno drži visoko, saj vsak požirek šteje! 🥃🔥	1	{"points": 5, "teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr5nh8s0000ju049ugavvcj", "drinkType": "BEER_RADLER"}	f	2025-09-19 19:17:18.815	\N
cmfr81ozr001qi104vvwmeaza	streak	🔥 Anej je v osrčju akcije! Z neverjetnim tempom se loteva žganja in z vsakim požirkom dviga hitrost, da bi dosegel tiste 3 pijače v 30 minutah! 🥳👏 Poglejte ga, ekipa SAŠA UDOVIČ WANNABE je v ognju! 💥🍹	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr5nh8s0000ju049ugavvcj", "drinkType": "BEER_RADLER", "streakCount": 3}	f	2025-09-19 19:17:27.879	\N
cmfr81r0u001ri1042mgrqbmx	hype	In to je to, dragi navijači! Anej iz ekipe SAŠA UDOVIČ WANNABE je pravkar prejel novo pijačo – žganje! 🍹🔥 S svojimi 5 točkami in 4 napitki si privošči še en dramatičen trenutek! Poglejte, kako se ta ekipa bori za zmago in si želi prislužiti še več točk! Gremo, Anej	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr5nh8s0000ju049ugavvcj", "trigger": "test_always"}	f	2025-09-19 19:17:30.51	\N
cmfr81rxq0014ik046p0mwl1s	team_event	🔊 Wow, ekipa SAŠA UDOVIČ WANNABE je spet na konju! 🏆 Igralec paX s 10 točkami in 7 popitimi pijačami dviga moral, ko ekipa dosega neverjetnih 39 točk! 🍻🔥 Žganje je na mizi in energija narašča - kdo bo prvi do zmage? 💪🥇	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "teamPoints": 39}	f	2025-09-19 19:17:31.694	\N
cmfr82rjf000cky04aarc299g	team_leadership	🚀 Uuuuu, kaj se dogaja na igrišču! 👑 NOVO EKIPNO VODSTVO v SAŠA UDOVIČ WANNABE: Tajsss (11) je s svojim žganjem +2 točki prehitel paX (10) in skočil na impresivno 2. mesto! 🏟️ Ta dramatična sprememba bo zagotovo preoblikovala dinamiko ekipe!	4	{"userId": "cmfr34sa90000ib04lr2ohjjz", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY"]}	f	2025-09-19 19:18:17.835	\N
cmfr82sma000fky04c8zk3do4	rank_jump	🚀 Velik šok za konkurenco! Optimus Prime je s svojim drznim skokom iz 9. na 5. mesto v globalnem rangu dosegel neverjeten napredek, kljub temu da je zbral 0 točk! 📈 Prekašeni so že obupani, kajti ta robot iz vesolja je pripravljen na zmago!	2	{"userId": "cmfr6kcxd000ai1045l249snz", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:18:19.234	\N
cmfr82vr7000gky04lx7a83f4	rank_jump	🚀 Davor je pravkar zablestel na društvenem parketu in z odličnim skokom z 12. na 6. mesto v globalnem rangu pokazal, da se v "Pokal Šanka" nikoli ne smeš predati! 📈 Prekašeni so bili vsi, ki so ga podcenjevali, zdaj pa je čas, da ga vsi vzamemo resno!	2	{"userId": "cmfr6k8bp0009i104v5au9ifv", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:18:23.299	\N
cmfr84pq10010l104fjpvhf8c	hype	In zdaj imamo pred seboj Jens, ki se podaja v akcijo z žganjem! 💥 Z osmimi točkami in šestimi pijačami v ozadju, ta fant ne pozna meja! 🎉 Ekipa SAŠA UDOVIČ WANNABE je trenutno na vrhu z 44 točkami, a zdaj je čas, da Jens dokaže, da je prava sila! 🏆 Kdo bo odnesel to zm	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4kxns0000l4041hif9ufo", "trigger": "test_always"}	f	2025-09-19 19:19:48.701	\N
cmfr81wrc001ti104m3hgmqr0	hype	In zdaj se z nami pripravlja Anej iz ekipe SAŠA UDOVIČ WANNABE! 💪🔥 S 5 točkami in štirimi pijačami, trenutno dviguje energijo s svojim žganjem! 🥃💥 Ali bo uspel doseči še več in popeljati svojo ekipo do zmage? Vzdušje je napeto, gledalci, pripravite se na spektakel! 🎉	1	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr5nh8s0000ju049ugavvcj", "trigger": "random_hype"}	f	2025-09-19 19:17:37.944	\N
cmfr84pq10011l104iqa1izb5	team_overtake	Uuuuu, to je neverjeten trenutek na Pokalu Šanka! 🏁 Kras united je s spektakularnim prehitom prehitela Smokeye in se povzpela na 3. mesto, medtem ko so Smokeye zdrsnili na 4. mesto – to je pravi dramatičen obrat v boju za ekipno prvenstvo! ⚡	3	{"userId": "cmfr6ksyb0000ky04l2z69bak", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_OVERTAKE", "RANK_JUMP"]}	f	2025-09-19 19:19:48.701	\N
cmfr81yfo0015ik04rohqbimg	streak	🔥 "Kicho je v neverjetnem nizu! S 13 točkami in 6 pijačami v žepu se zdaj podaja po žganje, ki mu lahko prinese dodatne 2 točki! 🔥 Hitrost in intenzivnost sta ključni, ali bo zdržal to neustavljivo energijo?! 🥳🍻"	3	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr60zip0001ju04bdvm726u", "drinkType": "AMARO", "streakCount": 3}	f	2025-09-19 19:17:31.695	\N
cmfr84z4e0016ik045kkjkt50	hype	In, in, in! Kicho iz ekipe Smokeye je v igri s svojim žganjem, kar pomeni dodaten dvig za 2 točki! 🎉🔥 S 13 točkami in 6 popitimi pijačami že kaže, da so pripravljeni na napad! Navijamo za Kicho in ekipo, da dosežejo nove višave! 🥳🍻	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr60zip0001ju04bdvm726u", "trigger": "test_always"}	f	2025-09-19 19:20:00.974	\N
cmfr8pevo0019ik04w3lwtu2b	top_3_change	🥉 VELIKI PREOBRATEK! Jens je s svojim močnim žganjem pridobil 2 točki in z neverjetno energijo skočil na 3. mesto, kar pomeni nov vstop v TOP 3! Kdo bo zdaj rešil ta boj za stopničke? 🔥🍹	4	{"userId": "cmfr4kxns0000l4041hif9ufo", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 19:35:54.424	\N
cmfr8rc7i0004jl04zcfxn5hf	team_leadership	🔥 OHHHH, KAJ SE DOGAJA! 👑 NOVO EKIPNO VODSTVO v Sasa žene je zdaj v rokah Elene, ki je s svojo neverjetno predstavo in žganjem (+3 točke) prehitela Katharino in skočila na čudovito 3. mesto! 🏟️ Navdušenje narašča, to je šele začetek! 💪🥉	4	{"userId": "cmfr7bh9v000pl104hm0a3n8l", "changes": 3, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY", "RANK_JUMP"]}	f	2025-09-19 19:37:24.366	\N
cmfr8sftb0004l104ushjzc75	last_place_change	In zdaj, dragi gledalci, se je zgodil preobrat! Lara in Kras united so padli na zadnje mesto, a ne obupajte! 💪🍻 Zdaj imamo priložnost, da se dvignemo in pokažemo pravo moč v preostalih rundah!	2	{"userId": "cmfr8q0jz001aik04xmv2ii8z", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY"]}	f	2025-09-19 19:38:15.135	\N
cmfr8shcp0007l104svhff9qw	rank_jump	🚀 Uuuh, kaj se dogaja! Lara je naredila spektakularen skok s 18. na 14. mesto v globalnem rangu! 📈 Še naprej pokaži svojo moč in prekašaj vse nasprotnike! 🍻	2	{"userId": "cmfr8q0jz001aik04xmv2ii8z", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:38:17.689	\N
cmfr8t18d0008l104g6y78912	rank_jump	🚀 Vau, Lara! S tem izjemnim skokom iz 14. na 9. mesto si pokazala pravo moč v pitju! 📈 Prekašala si številne tekmovalce in dokazala, da se lahko vsaka pijača spremeni v zmago! 🎉🥳	2	{"userId": "cmfr8q0jz001aik04xmv2ii8z", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:38:43.363	\N
cmfr8uaaq000bl104cg3kk6ud	streak	🔥 Lara je v vsem svojem sijaju! S to neverjetno hitrostjo in odločnostjo se podaja po žganje, da bi povečala svoj rezultat na neverjetnih 12 točk! 💥 Ekipa Matija, Zoja in Dominik mora biti pripravljena, saj Lara ne ustavi!	3	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8q0jz001aik04xmv2ii8z", "drinkType": "MOSCOW_MULE", "streakCount": 4}	f	2025-09-19 19:39:41.858	\N
cmfr8ubt0000il104tmrwicgq	hype	In zdaj, pozor, pozor! Lara je na istem nivoju kot Matija, Zoja in Dominik z osupljivimi 9 točkami! 🎉🔥 S svojo trenutnimi 4 pijačami in močnim žganjem, ki ji prinaša dodatne 3 točke, je pred njo priložnost, da popelje ekipo na vrh! Kdo bo zmagovalec "Pokal Šanka"? Pogle	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8q0jz001aik04xmv2ii8z", "trigger": "test_always"}	f	2025-09-19 19:39:43.812	\N
cmfr8vdrv0003ky04k9wjf62z	last_place_change	Incredible! Dominik je z izjemnim napredkom skočil s 20. na 17. mesto! 💪⬆️ Hkrati pa je Kras United padel na zadnje mesto – a ne obupajte, fantje! 💪🍻 Vse oči so na vas, čas je za preobrat!	2	{"userId": "cmfr8uiwz0000jl04wvrscqzf", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY", "RANK_JUMP"]}	f	2025-09-19 19:40:33.02	\N
cmfr8wg660006ky046cxvrz29	last_place_change	Bravo, Zoja! 💪⬆️ S tem velikim skokom s 21. na 17. mesto si pokazala pravo športno srce! Hkrati pa ne obupaj, ekipa Kras united bo še naprej z vami – navijamo za vas, da se kmalu dvignete! 💪🍻	2	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY", "RANK_JUMP"]}	f	2025-09-19 19:41:22.782	\N
cmfr8x7sx0009ky04vx6hgbg3	rank_jump	🚀 Wow! Zoja je naredila neverjeten velik skok s 17. na 13. mesto v globalnem rangu, kar je res impresivno! 📈 Čeprav je pridobila le 2 točki s trenutnim žganjem, je prekašala številne konkurente in pokazala, da je v igri prava sila!	2	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:41:58.501	\N
cmfr8x9o8000cky04cxmoomtf	rank_jump	🚀 VELIK SKOK za Zojo! 💥 Izjemno je preletela iz 13. na 9. mesto v globalnem rangu, kar je pravi dokaz njene vztrajnosti in strasti do igre! 📈🥳	2	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:42:01.016	\N
cmfr8zedb001eik04g8uq3dzw	rank_jump	🚀 Dominik je pravkar opravil osupljiv skok s 18. na 14. mesto v globalnem rangu! 📈 Čeprav je pridobil samo 2 točki z žganjem, je to dovolj, da preseneti vse nas in prekaša svoje konkurente!	2	{"userId": "cmfr8uiwz0000jl04wvrscqzf", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:43:40.415	\N
cmfr922ds000fky04sun6rh0l	last_place_change	Incredible! 🎉 Matija je s svojim žganjem zabeležil velik korak naprej in skočil s 22. na 19. mesto! 💪⬆️ Hkrati pa se moramo spomniti, da je Kras united padel na zadnje mesto, vendar ne obupajte, fantje! 💪🍻 Vsaka pijača šteje, in z malo volje se lahko vrnete nazaj na vrh!	2	{"userId": "cmfr8yyqg000ll104sxm0hkut", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY", "RANK_JUMP"]}	f	2025-09-19 19:45:44.276	\N
cmfr94err0004jo04l2zlwmmo	top_3_change	Incredibilno! Urosh je z izjemnim skokom s 8. na 3. mesto v globalnem rangu prevzel mesto na stopničkah! 🥉 S svojim žganjem je pokazal pravo moč pitja in dokazal, da se v boju za pokal ne sme nikoli obupati!🔥🥳	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "RANK_JUMP"]}	f	2025-09-19 19:47:33.649	\N
cmfr9iqi6000bl104463r5h9j	rank_jump	🚀 Anej je preskočil vsem pričakovanjem in z neverjetnim skokom z 14. na 11. mesto 📈! Kljub začetnim 0 točkam je z žganjem osvojil novo energijo, ki je presegla konkurenco! 🎉	2	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:58:42.515	\N
cmfr9pz86000gl104ao3xednk	leadership_change	🏆 Novi vladar pitja je Urosh! Z osupljivimi 15 točkami je prehitel Katharino (14) in prevzel globalno vodstvo z eno samo točko razlike! 👑 A to ni vse! Urosh prevzema tudi ekipno vodstvo v SAŠA UDOVIČ WANNABE, saj je s svojo zmago nad Tajsss (13) zgradil prednost dveh to	5	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN", "TEAM_LEADERSHIP"]}	f	2025-09-19 20:04:20.411	\N
cmfr9zmb1001hl104vmo80gh0	hype	In, in, in! Katharina je na vrhuncu igre, s skupno 21 točkami in 9 pijačami! 🍻🔥 Zdaj se pripravlja, da povzdigne svojo ekipo Sasa žene, ki že vodi s 40 točkami! Zdaj, ko se podaja proti žganju, lahko pričakujemo, da bo ta trenutek pravi spektakel! 🥳💥 Poglejte jo, kako se	2	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr59jlr000qjm04rjfba2vx", "trigger": "test_always"}	f	2025-09-19 20:11:50.318	\N
cmfra89xq000kl404ressjmxv	consolidated_bulk	🔥🏁 OPOZORILO, MNOŽICA! V popolnem kaosu, Davor, Mrax in Optimus prime hkrati zavihtijo steklenice žganja in na plano prinesejo neverjeten spektakel! 🚀 Davor se z neverjetnim skokom preseli z 9. na 5. mesto, Optimus prime z 12. na 6., Mrax pa napreduje iz 14. na	3	{"teams": ["Kras united"], "changes": 5, "trigger": "enhanced_bulk", "userIds": ["cmfr6k8bp0009i104v5au9ifv", "cmfr6ksyb0000ky04l2z69bak", "cmfr6kcxd000ai1045l249snz"], "drinkType": "MOSCOW_MULE", "userCount": 3, "changeTypes": ["TEAM_OVERTAKE", "TEAM_OVERTAKE", "RANK_JUMP", "RANK_JUMP", "RANK_JUMP"], "totalPoints": 9}	f	2025-09-19 20:18:34.19	\N
cmfrae9ev001pl104ywl6sxj5	team_leadership	🏟️🔥 NEVERJETEN PREOBRAT! Lara je s svojim žganjem poskrbel za sanjski skok in prevzel vodstvo ekipi Matija, Zoja, Dominik, s čimer je prehitel Zojo za eno samo točko! 👑 Zdaj je na 3. mestu globalnega ranga in pripravljena na še večje izzive! 🥉💪	4	{"userId": "cmfr8q0jz001aik04xmv2ii8z", "changes": 3, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY", "RANK_JUMP"]}	f	2025-09-19 20:23:13.448	\N
cmfraeb4m001ql1048pq2empr	rank_jump	🚀 Bravo, Matija! S svojim odločnim skokom v pijačo žganje si preskočil iz 17. na 14. mesto 📈 in s tem pokazal, da si pravi borec v "Pokal Šanka"! Prekašeni so padli, ampak pozor, to je le začetek tvoje poti!	2	{"userId": "cmfr8yyqg000ll104sxm0hkut", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:23:15.67	\N
cmfrack48000ljo04ytjaxnm6	consolidated_bulk	🔥👑 Prijatelji, pozor! Vse na glavo! Elena je s svojim neverjetnim nastopom v pitju žganja povzročila popoln kaos in s tem zgodovinski preobrat, saj je skočila s 10. na 5. mesto! 🚀🏁 Ekipa Sasa žene se lahko le čudi, kako je ta epski spektakel v tako kratkem času preoblikoval celotno lestv	2	{"teams": ["Sasa žene"], "changes": 1, "trigger": "enhanced_bulk", "userIds": ["cmfr7bh9v000pl104hm0a3n8l"], "drinkType": "JAGER_SHOT", "userCount": 1, "changeTypes": ["RANK_JUMP"], "totalPoints": 2}	f	2025-09-19 20:21:49.714	\N
cmfraekmr001tl104dgi58a7s	rank_jump	🚀 Ne morem verjeti svojim očem! paX je z neverjetnim skokom prehitel vse ovire in z 9. na 6. mesto v globalnem rangu! 📈 Prekašeni igralci, poglejte se - z žganjem je ta zvezda pokazala, da je pripravljena na velike zmage! 🍻	2	{"userId": "cmfr4xnlr0003l504mnluk06k", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:23:27.987	\N
cmfr975kl0005jo04wgv7edom	team_leadership	Incredible! 🎉 Urosh je prevzel vodstvo v ekipi Saša Udovič Wannabe s 12 točkami, kar pomeni, da je prehitel Tajsss in pokazal pravo zmagovalno naravo! 👑🏟️ Vzdušje je napeto, saj se ostali borijo, da bi se vrnili med najboljše!	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 5, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_EXIT", "TOP_3_EXIT", "TOP_3_EXIT", "TOP_3_EXIT"]}	f	2025-09-19 19:49:42.168	\N
cmfr98wkw000ajo04hd0hu0j3	streak	🔥 Urosh je v ognju! Z vsakim požirkom žganja dodaja energijo svoji ekipi SAŠA UDOVIČ WANNABE in postavlja nov ritem, da bi dosegel neverjetnih 53 točk! 🍹🏆 Gremo, Urosh, pokaži nam, kako se to dela! 💪🎉	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "BEER_RADLER", "streakCount": 5}	f	2025-09-19 19:51:03.827	\N
cmfr98wy1000djo043rbbhh76	top_3_change	In štartamo! 🏁 paX s svojo izjemno predstavo v pitju žganja po neverjetnem vzponu zdaj zaseda 3. mesto! 🥉 Kdo bo lahko ustavil to energično zverino, ki se je ravnokar pridružila boju za stopničke?	4	{"userId": "cmfr4xnlr0003l504mnluk06k", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 19:51:03.828	\N
cmfr99ke5000fjo046fjsu5ym	hype	Incrediblen Urosh je na vrhuncu! 🏆🔥 S 13 točkami in 10 popitimi pijačami je pravi zvezdnik ekipe SAŠA UDOVIČ WANNABE, ki z neverjetnimi 53 točkami blesti kot zvezda na nebu! 🌟🥳 Zdaj pa po "žganju" pošteno zasukajmo to tekmovanje, Uro	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 19:51:31.829	\N
cmfr99ke4000ejo046nf57c50	top_3_change	In to je to, dragi gledalci! 🎉 Jens je z vrhunskim žganjem zablestel in v hipu skočil iz 5. mesta na stopničke – zdaj zaseda tretje mesto! 🥉 Kdo ve, morda ga čaka še kakšna presenečenja v boju za zlato! 🥇	4	{"userId": "cmfr4kxns0000l4041hif9ufo", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 19:51:31.819	\N
cmfr9bvgb0004l404cn7qw5i3	team_leadership	🏟️👑 VELIKA NOVICA! Katharina je prevzela vodstvo v ekipi Sasa žene z osupljivimi 12 točkami, s čimer je prehitela Eleno in skočila na 3. mesto globalno! 🎉🥇 S tem dvigom je postavila nove standarde in pokazala, da je prava kraljica pitja! 🍹🚀	4	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 6, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY", "TOP_3_EXIT", "TOP_3_EXIT", "TOP_3_EXIT", "RANK_JUMP"]}	f	2025-09-19 19:53:21.861	\N
cmfr9byp80005l404o173k2m4	leadership_change	Incrediblen trenutek! 👑🏆 Katharina prevzema vodstvo z neverjetnimi 14 točkami in s tem osvoji nov prestol, saj je prehitel Kicho z razliko 1 točke! 🥳👏	5	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN"]}	f	2025-09-19 19:53:26.637	\N
cmfr9gib60008la049xxtg17a	hype	Inštruktorji in gledalci, pozor! 🥳 Zoja je zdaj na vrhuncu igre s 9 točkami in 4 pijačami, medtem ko ekipa suvereno vodi z 26 točkami! 🏆 Zdaj pa je čas, da zagrabi žganje in dvigne točko na nov nivo! 🍹🔥 Kdo bo prvi prepolovil steklenico? Poglejte	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "trigger": "test_always"}	f	2025-09-19 19:56:58.674	\N
cmfr9gr4v0002l1044g1kvjzv	team_leadership	🏟️👑 Vse se spreminja! Tajsss je eksplodiral na 2. mesto in prevzel vodstvo v SAŠA UDOVIČ WANNABE ter z 13 točkami izenačil z Uroshom! Žganje mu je prineslo dodatne 2 točki in ekipa zdaj stavi na njegov neverjeten potencial! 🍻🔥	4	{"userId": "cmfr34sa90000ib04lr2ohjjz", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY"]}	f	2025-09-19 19:57:10.112	\N
cmfr9t5a9000nl104fjkthfe1	milestone	Incredible! 🎉 Bwsk je ravnokar dosegel neverjetnih 5 točk! 🔥 Ekipa SAŠA UDOVIČ WANNABE se resnično vrača v igro s tem spektakularnim trenutkom, saj se veselimo, da bomo kmalu praznovali še večji uspeh! 🥳🍻	1	{"points": 5, "teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4wl5n0005jm04hv4w4epc", "drinkType": "BEER_RADLER"}	f	2025-09-19 20:06:48.321	\N
cmfr9t5pv000ql104mf82zdo0	rank_jump	🚀 Ooo, kaj se dogaja? Lozo je naredil VELIK SKOK in skočil s 18. na 13. mesto! 📈 Kljub začetnim 0 točkam in 0 pijačam, zdaj z žganjem pridobiva novo energijo! Se že veselim naslednjega njegovga poteza! 🥳🥃	2	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:06:48.322	\N
cmfr9t9nw000rl104vlfe0tbm	hype	In zdaj imamo pred seboj izjemnega Bwsk-a, ki je že dosegel 5 točk z 4 pijačami! 🔥 Ekipa SAŠA UDOVIČ WANNABE trenutno blesti s 62 točkami in z vsakim požirkom žganja povečujejo svoj cilj! 🥃 Kdo bo prevzel vodstvo? Dvignite energijo in navijajte, kajti ta boj je še zdaleč od kon	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4wl5n0005jm04hv4w4epc", "trigger": "test_always"}	f	2025-09-19 20:06:53.997	\N
cmfr9ue1q000wl104jp07s9fe	hype	In zdaj imamo na vrsti Lozo iz ekipe Smokeye! 🎉 Z 7 točkami in 5 popitimi pijačami se pripravlja na nov pospešek z žganjem! 🥃🔥 Čas je, da pokaže, kaj zmore, in da ekipa doseže novih 27 točk! Gremo, Smokeye! 💪💥	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "test_always"}	f	2025-09-19 20:07:45.771	\N
cmfr9ufou000zl104qrb2bk9p	streak	Urosh se pripravlja na osupljiv niz! 🔥 S hitrim tempom in strastjo se pripravlja, da požge svoje nasprotnike z vsakim požirkom žganja! 🍹💪 Poglejte ga, kako nabira točke – ta energija je neustavljiva! 🎉🔥	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "JAGERMEISTER", "streakCount": 7}	f	2025-09-19 20:07:48.463	\N
cmfr9wzzp0015l104x76w85n5	streak	Urosh je v neustavljivem ritmu, njegovo žganje se razliva po kozarcu kot ogenj! 🔥 S 13 pijačami in 18 točkami je pravi stroj, ki drvi proti zmagi ekipa SAŠA UDOVIČ WANNABE! 💥🥳	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "BEER_RADLER", "streakCount": 8}	f	2025-09-19 20:09:47.994	\N
cmfr9wzzq0016l104enx5zowi	hype	In zdaj, Urosh, s številko 17 na seznamu, se pripravlja na svoj naslednji krog! 🍻 Ekipa SAŠA UDOVIČ WANNABE se s 64 točkami bori za vrh, toda žganje mu lahko prinese dodatne točke! 🔥 Kdo bo dvignil to energijo na višji nivo? Let's go! 🥳💪	1	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "random_hype"}	f	2025-09-19 20:09:47.994	\N
cmfr9zk3s001gl104sjp7xjhx	streak	🔥 Oglejte si Katharino, kako se požene v nov niz pitja! Z vsakim požirkom žganja pridobiva energijo, njena ekipa "Sasa žene" pa jo spremlja v neustavljivem ritmu! 🥳🍹	3	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr59jlr000qjm04rjfba2vx", "drinkType": "ESPRESSO_MARTINI", "streakCount": 5}	f	2025-09-19 20:11:47.464	\N
cmfr9gfyx0006la04q3y9ikcg	streak	🔥 Zoja je v zagonu! Z vsakim požirkom žganja dviga udarno moč svoje ekipe in se približuje tisti magični številki 26 točk! 🥳🍻 Ritem je pravi, tempo je ognjen, to bo pravi spektakel! ⚡️💥	3	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "drinkType": "AMARO", "streakCount": 4}	f	2025-09-19 19:56:55.641	\N
cmfr9gg3j0007la04zm403khd	rank_jump	🚀 Uau, kaj za presenečenje! Lara je kot meteorit zletela s 8. na 4. mesto! 📈 S tem velikim skokom je prekašala vse nasprotnike in pokazala, da je pripravljena na vrhunec v "Pokal Šanka"! 🍹🔥	2	{"userId": "cmfr8q0jz001aik04xmv2ii8z", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 19:56:55.807	\N
cmfr9wn690010l104rtdgif3z	hype	In pričakujemo spektakularen trenutek, ko Urosh dvigne svoj kozarec z žganjem! 🔥 Z neverjetnimi 17 točkami in 12 popitimi pijačami se pripravlja, da ekipo SAŠA UDOVIČ WANNABE popelje še bližje zmagi! 🏆🍻 Poglejmo, ali bo ta pijača prinesla dodatne 2 točki, ki jih	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 20:09:31.383	\N
cmfr9yvfe001al1041npdviwg	hype	In zdaj, dragi gledalci, Urosh se podaja v areno s svojo trenutni pijačo - žganje! 🥃🔥 Z 18 točkami in 13 pijačami, uresničuje sanje SAŠA UDOVIČ WANNABE! 👏💪 Poglejte ga, kako se bori za vsak požirek in dodatne točke! Kdo bo zdržal do konca? Nav	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 20:11:11.666	\N
cmfr9yvfe0019l104gfcyi0zm	team_overtake	NEVERJETNO! 🔥 V spektakularnem prehitu je ekipa Smokeye ujela Matijo, Zojo in Dominika, kar pomeni dramatičen obrat v boju za ekipno prvenstvo! 🏁 Sedaj so Smokeye na 3. mestu, medtem ko so njihovi konkurenti na 4. mestu z le 1 točko razlike! ⚡	3	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_OVERTAKE"]}	f	2025-09-19 20:11:11.665	\N
cmfr9z9r7000ijo04uqazuqv9	streak	🔥 In tu je Katharina, ki se pripravlja na svoj tretji požirek žganja! Z neverjetnim tempom in strastjo dviguje energijo ekipe Sasa žene, saj se že približujejo 35 točkam! 💪🍹 Ta niz je prava eksplozija adrenalina!	3	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr59jlr000qjm04rjfba2vx", "drinkType": "AMARO", "streakCount": 3}	f	2025-09-19 20:11:34.051	\N
cmfr9zccg001dl104imjg3v2t	leadership_change	Incredibilno! 👑🏆 Novi vladar pitja, Katharina, je s svojimi 18 točkami prevzela vodstvo in prestol je padel iz rok Urosha! Razlika je 0 točk, a napetost je zagotovo na vrhuncu!	5	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN"]}	f	2025-09-19 20:11:37.408	\N
cmfra2dax0002l204ll45hzf0	team_leadership	Incredible! 👑 Davor prevzema vodstvo v Kras united in z 9 točkami prehiteva Optimus prime! 🏟️ S tem velikim skokom je Davor dokazal, da je pravi borec – naprej do zmage! 🍻💥	4	{"userId": "cmfr6k8bp0009i104v5au9ifv", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "RANK_JUMP"]}	f	2025-09-19 20:13:58.525	\N
cmfra7yq10008l404agrs2zma	last_place_change	In tako, dragi gledalci, imamo nov izziv za našega igralca Topo! 💪🍻 Kljub padcu na zadnje mesto, ne obupajte – z vsakim požirkom lahko pridemo nazaj na vrh! Pokaži, Topo, da zmoreš!	2	{"userId": "cmfra2kbm0003l204769m6hui", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LAST_PLACE_ENTRY"]}	f	2025-09-19 20:18:19.657	\N
cmfra85s1000hl4048zqixipg	consolidated_bulk	🔥👉 OPOZORILO! Vse na glavo! Matija, Zoja in Dominik so skupaj zablesteli v osrčju "Pokal Šanka" in zneverjetnim spektaklom žganja prinesli popoln kaos na tekmovanje! 🍻🏁 Z zgodovinskim preobratom so prehiteli Smokeye in pridobili zasluženo 3. mesto! 🚀 Matija je z velikim	3	{"teams": ["Matija, zoja, dominik"], "changes": 2, "trigger": "enhanced_bulk", "userIds": ["cmfr8yyqg000ll104sxm0hkut"], "drinkType": "JAGERMEISTER", "userCount": 1, "changeTypes": ["TEAM_OVERTAKE", "RANK_JUMP"], "totalPoints": 2}	f	2025-09-19 20:18:28.238	\N
cmfra8m5q000pl404yffsce0w	hype	In še enkrat se Krix podaja v boj! 🎉 Zdravimo te na tej osupljivi tekmi, kjer je ekipa Sasa žene že dosegla neverjetnih 42 točk! 🔥 Krix, s svojimi 8 točkami in 4 pijačami, se pripravlja na nov napad! Sedaj se mu v roki znajde žganje, ki prinaša dodatni bonus! 🚀 Kdo	2	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr4z6u10004l504udjouaxy", "trigger": "test_always"}	f	2025-09-19 20:18:49.939	\N
cmfragdbq000rjo0489p2js6l	team_leadership	🏟️ 🎉 Imamo novico, ki bo pretrese svet pitja! Zoja iz ekipe Matija je s svojo neverjetno predstavo preskočila Laro in prevzela vodstvo s 14 točkami! 👑🔥 Razlika? Le 1 točka! Poglejte, kako se igra obrača!	4	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 6, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY", "TOP_3_EXIT", "TOP_3_EXIT", "TOP_3_EXIT", "RANK_JUMP"]}	f	2025-09-19 20:24:51.738	\N
cmfracnqx000sl404lwmg7fou	hype	In zdaj imamo na prizorišču našega junaka, Topo! Z 4 točkami in že dvema popitima pijačama, je pripravljen na še en veliki zalogaj žganja, ki mu lahko prinese dodatne 2 točki! 🚀🔥 Kras united se drži na vrhu s 39 točkami, a s tem energičnim pristopom Topo ne bo dal miru nikomur! Gremo	2	{"teamId": "cmfr6kpvw000bi104mydir0kt", "userId": "cmfra2kbm0003l204769m6hui", "trigger": "test_always"}	f	2025-09-19 20:21:58.622	\N
cmfradi92000vl404gsafxr4v	rank_jump	🚀 Vau, Topo! Iz nič na 16. mesto! 📈 S svojim skokom z 20. na 16. mesto si prekašal številne nasprotnike in pokazal, da se tudi z žganjem da doseči velik napredek! 🥳 Kdo ve, kakšne višave te še čakajo!	2	{"userId": "cmfra2kbm0003l204769m6hui", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:22:37.941	\N
cmfrae7dm001ml104ytsg66d2	team_leadership	🚀 VELIKI MOMENT na Pokalu Šanka! 👑 Zoja je prevzela vodstvo in z 12 točkami prehitela Laro, s čimer se je povzpela na 5. mesto globalno! 🏟️ Ekipa Matija, Zoja, Dominik se zdaj lahko ponosno pohvali z novo voditeljico! 🎉	4	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "RANK_JUMP"]}	f	2025-09-19 20:23:10.244	\N
cmfraexc6000ojo04u8hsew0m	rank_jump	🚀 O, kaj se dogaja! Dominik je naredil neverjeten skok in se zavihtel s 18. na 14. mesto! 📈 Kdo bi si mislil, da bo žganje tako učinkovito? Čestitke, Dominik! 🎉	2	{"userId": "cmfr8uiwz0000jl04wvrscqzf", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:23:44.455	\N
cmfrak73p0010l404w8pui6sp	top_3_change	In še en razburljiv preobrat v Pokalu Šanka! 🥉 Kicho se je s svojim žganjem zasidral na 3. mesto, medtem ko je Zoja žal padla na 4. mesto – napetosti na vrhu se krepijo! 🍹🔥	4	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "TOP_3_EXIT"]}	f	2025-09-19 20:27:50.389	\N
cmfraok70000hla04o9fvt53g	hype	In zdaj imamo Kicho iz ekipe Smokeye, ki je že dosegel neverjetnih 18 točk! 🎉 Z 8 pijačami v svojem arzenalu in trenutnim žganjem, ki mu prinaša dodatne 2 točki, se zagotovo pripravlja na pravo eksplozijo! 🔥 Poglejte ga, kako se pripravlja na akcijo, to bo zagotovo trenutek, ki ga ne smemo zamuditi!	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr60zip0001ju04bdvm726u", "trigger": "test_always"}	f	2025-09-19 20:31:13.887	\N
cmfrb1uro000kla04djybfbph	hype	VIK IN VIHAR NADALEJUJE! 🔥🍻 Tajsss se pripravlja na nepozaben spektakel, kjer ekipa SAŠA UDOVIČ WANNABE zažge s skupinsko akcijo! Ta neverjeten prizor bo ostal zapisan v zgodovini "Pokala Šanka", saj se vsi skupaj podajajo na pot žganja - kdo bo prvi do zmage? Ne zamudite te dramatične bitke	3	{"teams": ["SAŠA UDOVIČ WANNABE"], "trigger": "bulk_drink", "userIds": ["cmfr34sa90000ib04lr2ohjjz"], "drinkType": "JAGERMEISTER", "userCount": 1, "totalPoints": 2}	f	2025-09-19 20:41:33.635	\N
cmfrb342p000nla048khr0hrx	rank_jump	🚀 Krix je naredil neverjeten skok iz 14. na 10. mesto v globalnem rangu! 📈 S svojo trenutno pijačo žganje je prekašal vse nasprotnike in dokazal, da se v "Pokal Šanka" vedno splača vztrajati! 🍹🥳	2	{"userId": "cmfr4z6u10004l504udjouaxy", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:42:32.837	\N
cmfrb5bp4000ula0477lpj41u	hype	Pripravite se, dragi gledalci, ker se dogaja pravi spektakel! 🔥 Tajsss se podaja v bojišče pijanih junakov, ekipa SAŠA UDOVIČ WANNABE pa s svojim neustavljivim žganjem za vse zavzema vrh! 🍻 Vik in vihar nadaljujeta, in to je NEVERJETEN PRIZOR, ki ga ne smete zamuditi – kje so	3	{"teams": ["SAŠA UDOVIČ WANNABE"], "trigger": "bulk_drink", "userIds": ["cmfr34sa90000ib04lr2ohjjz"], "drinkType": "JAGERMEISTER", "userCount": 1, "totalPoints": 2}	f	2025-09-19 20:44:15.994	\N
cmfrb6ski0002l204owf2o31h	rank_jump	🚀 Čudežen skok! Lozo je s svojim močnim žganjem uspel narasti iz 10. na 6. mesto v globalnem rangu! 📈 Prekašeni so številni tekmeci, ki niso pričakovali takšnega preobrata! 🍹🔥	2	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:45:24.549	\N
cmfrb8fw40002l1040qhv6zyo	milestone	In tu je to! 🎉 Lozo dosega čarobnih 15 točk! 🙌 Ekipa Smokeye se dviga v višave, z 40 točkami na čelu, a ta trenutek pripada tebi, Lozo! 🥳🍹	2	{"points": 15, "teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "drinkType": "VODKA"}	f	2025-09-19 20:46:41.525	\N
cmfrb8v4f0004l70431f59iwd	rank_jump	🚀 VELIK SKOK! Anej je s silovitim skokom preskočil iz 17. na 14. mesto v globalnem rangu! 📈 Prekašeni so bili njegovi nasprotniki, ki so ga podcenjevali! Na vrhu se obeta še več akcije! 🍻	2	{"userId": "cmfr4xnlr0003l504mnluk06k", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:47:01.263	\N
cmfrb8va60007l704vlkdpcup	rank_jump	🚀 Anej je s svojim osupljivim žganjovim skokom naredil neverjeten napredek in zletel s 17. na 14. mesto! 📈 Prekašeni igralci so lahko samo občudovali njegov zagon, saj je pokazal, da je pripravljen na vse!	2	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:47:01.47	\N
cmfrb92ty0008l704yxulcasv	team_leadership	Incredible! 👑 Tajsss je z izjemnim nastopom zajel vodstvo v ekipi SAŠA UDOVIČ WANNABE in se povzpel na 2. mesto s skupno 19 točkami – samo 1 točka pred Uroshom! 🏟️ S tako energijo in žganjem v roki, kdo ve, kam ga bo še popeljalo?	4	{"userId": "cmfr34sa90000ib04lr2ohjjz", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TOP_3_ENTRY"]}	f	2025-09-19 20:47:11.255	\N
cmfrbbw08000dl704igq0hr6s	streak	🔥 Pridružite se nam v tem spektakularnem trenutku, medtem ko paX divje napreduje skozi niz! S 16 točkami in 11 pijačami, žganje v njegovih rokah obeta eksplozivno 30 minutno akcijo! 🥳🥃 #SAŠAUDOVIČWANNABE	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "drinkType": "AMARO", "streakCount": 3}	f	2025-09-19 20:49:22.284	\N
cmfrbbw0c000el704ewy9rsfy	rank_jump	🚀💥 Poglejte to! Anej je z neverjetnim skokom preletel z 14. na 11. mesto v globalnem rangu! 📈 Prekašeni so bili vsi, ki so ga podcenjevali - njegov napredek je pravi šampionski šus! 🥳🥃	2	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:49:22.288	\N
cmfrbd8vy000il704c9ti8fxg	top_3_change	Nepričakovani preobrat na Pohodnem Pokalu Šanka! 🥇 Urosh je zaskočil vse in s špricarjem žganja pridobil svojo prvo točko, medtem ko je Kicho nepričakovano zdrsnil na 4. mesto! 🥈🥉 Tekma je še daleč od konca, kdo bo uspelo priti nazaj na stopničke?!	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_EXIT"]}	f	2025-09-19 20:50:25.635	\N
cmfrbd8vy000hl704jnv8fw3u	hype	In točno to trenutek, paX iz ekipe SAŠA UDOVIČ WANNABE dviga temperaturo! 🔥 S skupno 16 točkami in 11 popitimi pijačami se muže, da tej ekipi prinese še dodatne točke s tem žganjem! 🥃 Naj bo ta trenutek napolnjen z energijo, da dosežejo vrhunske rezultati! 🚀💪	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "trigger": "test_always"}	f	2025-09-19 20:50:25.634	\N
cmfrbdgwo000ol704xs3pqkqv	consolidated_bulk	🔥🏁 Oh, kaj se dogaja na tem zgodovinskem trenutku Pokala Šanka! Tajsss se dviga na vrh, prehiteva Urosha, vse na glavo, kot pravi šampion! 🍻 Z ekipo SAŠA UDOVIČ WANNABE zdaj vodijo z neverjetnimi 2 točkama, medtem ko žganje leti iz kozarcev kot raketa! 🚀 Popoln kaos in	4	{"teams": ["SAŠA UDOVIČ WANNABE"], "changes": 1, "trigger": "enhanced_bulk", "userIds": ["cmfr34sa90000ib04lr2ohjjz"], "drinkType": "JAGERMEISTER", "userCount": 1, "changeTypes": ["TEAM_LEADERSHIP"], "totalPoints": 2}	f	2025-09-19 20:50:36.121	\N
cmfrbe3dv000rl7045vs034mz	rank_jump	Jens nas je danes presenetil z neverjetnim skokom 🚀, saj je napredoval s 11. na 8. mesto 📈! Kdo bi si mislil, da bo žganje tako močan adut? 🥃👏	2	{"userId": "cmfr4kxns0000l4041hif9ufo", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 20:51:05.16	\N
cmfrbde7x000ll704hvpr81u8	team_leadership	Incredibilno! 👑 Urosh prevzema vodstvo v SAŠA UDOVIČ WANNABE z 21 točkami in dviga ekipo na nove višine! 🏟️ Tajsss se mu je postavil po robu, a z razliko 2 točk je Urosh zdaj nesporni kapetan!	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 20:50:32.638	\N
cmfrbe9vr0003l104taevj1f4	streak	🔥 Oooo, Lozo je prišel v neverjeten ritem! Z 9 pijačami in 15 točkami je zdaj pripravljen na žganje, ki mu lahko prinese še dodatne točke! Da vidimo, ali bo zmožen doseči svoj cilj in dvigniti ekipo Smokeye še višje! 💥🍹	3	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "drinkType": "VODKA", "streakCount": 3}	f	2025-09-19 20:51:13.671	\N
cmfrbee910006l104d0p2s352	hype	In zdaj, gledalci, se pripravljamo na vrhunec! Lozo trenutno vodi z 15 točkami in 9 pijačami! 🔥 Ekipa Smokeye že blesti s 40 točkami, a Lozo je pripravljen, da razplamti strast s to žganje! 🥃💥 Poglejte, kako se bo ta napetost razvila!	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "test_always"}	f	2025-09-19 20:51:19.333	\N
cmfrbrfco0002kz04tq63neh3	team_leadership	Incredible! 🌟 Lara prevzema vodstvo v ekipi Matija, zoja, dominik in z novim skupnim rezultatom 15 točk postavlja novi rekord! 👑🏟️ Z le 1 točko prednosti pred Zojo, točke še naprej naraščajo – kdo bo še dodal svoje pijače?	4	{"userId": "cmfr8q0jz001aik04xmv2ii8z", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 21:01:27.196	\N
cmfrbso090002l40438t44fdk	streak	🔥⚡ In tukaj je paX, ki se podaja v noro avanturo s tremi pijačami v tridesetih minutah! Z vsakim požirkom žganja nabira energijo, ekipa SAŠA UDOVIČ WANNABE pa se že na široko smeji, saj s trenutno prednostjo 89 točk njena zmaga postaja vse bližje! 🥳🍹	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "drinkType": "AMARO", "streakCount": 3}	f	2025-09-19 21:02:25.069	\N
cmfrbsupz0003l404h8pd0exi	hype	In zdaj, dragi gledalci, paX se postavlja na oder z neverjetnimi 18 točkami in 12 pijačami! Ekipa SAŠA UDOVIČ WANNABE se resno približuje vrhu z 89 točkami, a sedaj paX dviga energijo s tistim močnim žganjem! 🔥🍹 Kdo ve, morda bo to zlat trenutek, ki jih popelje	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "trigger": "test_always"}	f	2025-09-19 21:02:33.285	\N
cmfrbtpiw0006l404nmr14uio	team_leadership	🔥🏟️ In imamo novo zvezdo na obzorju! 👑 Optimus prime je prevzel vodstvo v Kras united s skupno 14 točkami in prehitel Davora, ki zdaj zaostaja za 2 točki! Kaj vse lahko pričakujemo od tega energičnega pitca? 🚀🥃	4	{"userId": "cmfr6kcxd000ai1045l249snz", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "RANK_JUMP"]}	f	2025-09-19 21:03:10.322	\N
cmfrc4pmp000hl404wznf8npr	team_leadership	Incredibilno! Urosh je prevzel vodstvo v ekipi SAŠA UDOVIČ WANNABE z neverjetnimi 23 točkami in s svojo izjemno predstavo prehitel Tajsss! 👑🏟️ Zdaj je vse v igri, kako se bo ta napetost odrazila v nadaljevanju tekmovanja!	4	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP"]}	f	2025-09-19 21:11:46.572	\N
cmfrc5x4z000ll4042gvbzjp9	team_overtake	TO JE TO! 🏁⚡ Spektakularni prehit! Smokeye je s neverjetnim zamahom prehitela Kras united in se s tem povzpela na 3. mesto, medtem ko Kras united zdrsne na 5. mesto! Dramatičen obrat v boju za ekipno prvenstvo, razlika je le 1 točka! 🚀🥳	3	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TEAM_OVERTAKE"]}	f	2025-09-19 21:12:43.523	\N
cmfrc5x4y000kl404pygl8xy2	streak	🔥 Ne moremo verjeti, Lozo je v pravem ritmu! Z neverjetno hitrostjo pokončuje žganje in se približuje novim višinám, saj je s 18 točkami že pravi junak ekipe Smokeye! 🥳🔥	3	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "drinkType": "AMARO", "streakCount": 4}	f	2025-09-19 21:12:43.522	\N
cmfrc94740004l204gdniybp7	leadership_change	🏆 Pozor, pozor! Novi vladar pitja, Urosh, je prevzel vodstvo z neverjetnimi 25 točkami, kar pomeni, da je prestol padel iz rok Katharine, ki je sedaj na 23 točkah! 👑 Razlika je le 2 točki in napetost je na vrhuncu!	5	{"userId": "cmfr4ppcj0004jo04qpeiohzh", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["LEADERSHIP_TAKEN"]}	f	2025-09-19 21:15:12.548	\N
cmfrca79c000ml404qlble6ds	hype	In smo spet nazaj! 🎉 Lozo se pripravlja na svoj zadnji požirek žganja, ki mu lahko prinese ključne točke za ekipo Smokeye! 🔥 Z 18 točkami in 11 pijačami je v pravi formi – ali bo uspel prestreči zmago za svojo ekipo? Gremo, Lozo! 💪🥂	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "test_always"}	f	2025-09-19 21:16:03.119	\N
cmfrcd8l7000nl404pqog38zu	hype	In zdaj imamo na sceni našega zvezdnika, Lozota! 🍻 Z osupljivimi 18 točkami in 11 popitimi pijačami se pripravlja, da s trenutnim žganjem dvigne svojo ekipo Smokeye še višje! 🔥 Ekipa s 45 točkami se ne bo ustavila, dokler ne dosežejo vrha! Gremo, Lozot, pokaži, kdo je pravi šampion	1	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "random_hype"}	f	2025-09-19 21:18:24.382	\N
cmfrcmxs10006lb04bs4l8e4v	streak	🔥 Urosh se prižiga kot pravi šampion! Z neverjetnim tempom in energijo pije žganje, kot da je zmagovalna trofeja že v njegovih rokah! 🍻💪	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "PELINKOVAC", "streakCount": 3}	f	2025-09-19 21:25:57.489	\N
cmfrcn7860007lb04ooeg5arw	streak	🔥 Urosh je na vrhunskem ritmu! Z vsakim požirkom žganja, ki ga spije, se približuje zmagi in energija njegove ekipe SAŠA UDOVIČ WANNABE naraste na nov nivo! 🚀🥳	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "PELINKOVAC", "streakCount": 4}	f	2025-09-19 21:26:09.75	\N
cmfrcn87n000alb04u4wkdwqd	hype	In še en neverjeten trenutek! Urosh je s svojimi 27 točkami in 18 pijačami v ekipi SAŠA UDOVIČ WANNABE dvignil temperaturo v dvorani! 🔥🥳 Zdaj se spopada z žganjem, ki prinaša dodatni bonus – 2 točki! Kdo ve, morda bo prav on tisti, ki bo ekipo popeljal proti nov	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 21:26:10.935	\N
cmfrcnc5z000blb04345slhdw	hype	In ravno tako se Urosh pripravlja na naslednji sip, da bi dvignil svojo ekipo SAŠA UDOVIČ WANNABE še višje! 🔥 Z 29 točkami in 19 pijačami je že na odlični poti, a zdaj je čas za žganje! 🍹 Z vsakim požirkom se napetost stopnjuje, a Urosh je pripravljen! Poglejte ga, kako se b	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 21:26:16.152	\N
cmfrcw6pp000elb04eqaxjl73	hype	In zdaj, dragi gledalci, na prizorišče prihaja naš junak Urosh! 🎉 Z neverjetnimi 29 točkami in 19 pijačami v svojem arzenalu, se pripravlja na zadnji udarec z žganjem, ki mu lahko prinese dodatni dve točki! 🔥 Ekipa SAŠA UDOVIČ WANNABE se že pripravlja na napad, saj z 100 toč	1	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "random_hype"}	f	2025-09-19 21:33:08.418	\N
cmfrcw6pu000flb045gzwd6g0	rank_jump	🚀 Anej je naredil neverjeten skok s 11. na 7. mesto! 📈 Navdušeni smo nad njegovim napredkom, saj je prehitel konkurenco in dokazal, da z žganjem lahko dosežeš izjemne rezultate!	2	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 21:33:08.431	\N
cmfrdgjsw0015lb042uswwahp	top_3_change	Incredibilno! Kicho se je s svojim žganjem povzpel na 3. mesto 🥉 in zapolnil svojo točkovno praznino, predenj so se dotaknile steklenice! Kdo bi si mislil, da bo ta trenutek preobrata tako osupljiv – napetost na vrhu postaja neizmerna! 🎉	4	{"userId": "cmfr60zip0001ju04bdvm726u", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 21:48:59.072	\N
cmfrdgm8j0018lb04l76epwl4	top_3_change	Incredible! Katharina se vzpenja na vrh z žganjem in se približuje stopničkam! 🥇 Kicho pa je nepričakovano zdrsnil na 4. mesto, kar pomeni, da nas čaka napeta borba za TOP 3! 🥈🥉	4	{"userId": "cmfr59jlr000qjm04rjfba2vx", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_EXIT"]}	f	2025-09-19 21:49:01.679	\N
cmfrd527m000llb04tznye3qy	hype	In neverjetnem dvoboju Urosh trenutno drži 31 točk s 20 pijačami in se pripravlja, da z žganjem doda še dodatne 2! 🔥🥳 Ekipa SAŠA UDOVIČ WANNABE že dominuje s 105 točkami, a Urosh se ne misli ustaviti! Poglejte ga, kako se bori za zmago! 🍻💪 #Pokal	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 21:40:02.484	\N
cmfrd53pg000slb04vardfv56	streak	🔥 Urosh je v nizu pitja in njegova energija je na vrhuncu! 💥 Z vsakim požirkom žganja se približuje zmagi, ekipa SAŠA UDOVIČ WANNABE pa ne more verjeti, kako hitro nabira točke – to je pravi vodnjak adrenalina! 🥳🍻	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "JAGERMEISTER", "streakCount": 6}	f	2025-09-19 21:40:04.433	\N
cmfrd58pe000tlb048vy6f5dv	hype	In neverjetnem vzdušju se Urosh podaja na svojo zadnjo pijačo! 🔥 Z 21 pijačami in 33 točkami je že blizu zmagi, zdaj pa se pripravlja na žganje, ki mu lahko prinese dodatni dve točki! 💪 Ekipa SAŠA UDOVIČ WANNABE je v polnem zamahu s 107 točkami, a Urosh lahko s tem zad	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 21:40:11.474	\N
cmfrd8a54000ylb046uszdwlu	hype	In tu je, prijatelji! Dominik je na vrhu svoje igre s fantastičnimi 11 točkami in 4 skodelicami v svoji ekipi, ki skupaj blesti z 48 točkami! 💥 Zdaj pa se pripravite, ker Dominik v roki drži žganje, ki mu lahko prinese dodatne 3 točke! 🥃🔥 Vzdušje je električno, igrajmo naprej	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8uiwz0000jl04wvrscqzf", "trigger": "test_always"}	f	2025-09-19 21:42:33.305	\N
cmfrd8a7p000zlb04jeb9m39w	team_leadership	Incredible! 👑 Zoja iz ekipe Matija, zoja, dominik je s spektakularnim žganjem (+2 točk) prevzela vodstvo in prehitela Laro za 1 točko! 🏟️ Ekipa zdaj zaseda 2. mesto, tik pred Sasa žene – torej, pripravite se na pravi spektakel v "Pokal Šanka"!	4	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TEAM_OVERTAKE"]}	f	2025-09-19 21:42:33.305	\N
cmfrd90s80004lb04u1tx5twn	hype	In kakšnem stilu nastopa Zoja! 🔥 S 18 točkami in 8 pijačami se le še vzpenja! 🥳 Ekipa Matija, Zoja in Dominik je z neverjetnih 52 točkami na vrhu, zdaj pa z žganjem v roki, bo ta trenutek res eksploziven! 🥃 Let's go, ekipa! 💪🎉	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "trigger": "test_always"}	f	2025-09-19 21:43:07.74	\N
cmfrd943m0007lb04u3o7fum5	milestone	Incredibila! 🎉 Zoja je pravkar presegla magično mejo 20 točk! 🥳 S 9 požirkov in fenomenalnim žganjem je uspela dodati še 2 točki, ekipa Matija, Zoja in Dominik pa že skupno blesti s kar 54 točkami! 🥂🙌	2	{"points": 20, "teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "drinkType": "PELINKOVAC"}	f	2025-09-19 21:43:12.13	\N
cmfrd9hr40009lb041dibja67	top_3_change	In neverjetnem obratu dogodkov imamo novo članico na zmagovalnih stopničkah! 🥉 Zoja se je s svojimi odličnimi nastopi povzpela na 3. mesto, medtem ko je Tajsss žal padel na 4. mesto - boj za pokal Šanka postaja vse bolj napet!	4	{"userId": "cmfr5nh8s0000ju049ugavvcj", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "TOP_3_EXIT"]}	f	2025-09-19 21:43:29.733	\N
cmfrd9hr40008lb04uryh44we	streak	🔥 Pripravljeni, pozor, zdaj pa Zoja v polnem zamahu! Z vsakim požirkom žganja se bliža do zmage, saj je že pri 20 točkah in ta ritem jo lahko popelje do novega rekorda! 🍻💥	3	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "drinkType": "PELINKOVAC", "streakCount": 3}	f	2025-09-19 21:43:29.733	\N
cmfrd9npa000clb041lm18xix	hype	In neverjetno napetem trenutku, dragi ljubitelji pitja, Zoja brani barvico svoje ekipe! 🌟 S 20 točkami in 9 pijačami se pripravlja na zadnji udarec z žganjem, kar ji lahko prinese dodatne 2 točki! 🔥 Ekipa Matija, Zoja in Dominik že dviga temperaturo z 54 točkami! Kdo bo odnesel Pokal	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "trigger": "test_always"}	f	2025-09-19 21:43:37.534	\N
cmfrd9t55000flb04ycxyxfrr	streak	🔥 Zoja se je zdaj res razžarila! Z neverjetnim ritmom in odločnostjo se podaja k petim pijačam v 30 minutah – lahko ji uspe? Pripravite se na nepozabno predstavo! 🍹💥	3	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "drinkType": "PELINKOVAC", "streakCount": 5}	f	2025-09-19 21:43:44.586	\N
cmfrd9t56000glb04afp7oxph	team_event	Incredible! 🎉 Zoja je z osvojenimi 20 točkami in 9 popitimi pijačami zares zasijala v ekipi Matija, Dominik in ona, ki skupaj dosegajo neverjetnih 54 točk! 🍹🔥 Zdaj pa se pripravite, saj žganje prinaša dodatnih 2 točki – ekipa se podaja proti novim zmagam! 💪🥇	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "teamPoints": 54}	f	2025-09-19 21:43:44.586	\N
cmfrd9wyd000hlb04ihstja35	hype	In zdaj imamo pred seboj izjemno Zojo, ki je s svojimi 24 točkami in 11 pijačami prava zvezda na tem spektakularnem "Pokal Šanka"! 🎉🥳 Zdaj se pripravlja na žganje, kar ji bo prineslo dodatni dvig! 🔥 Kdo ve, morda bo prav ona tista, ki bo svoje moštvo popeljala do zmage! 💪🍹	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "trigger": "test_always"}	f	2025-09-19 21:43:49.525	\N
cmfrda1d3000ilb04km8n5wg3	streak	🔥 Zoja je v polnem zagonu! Z neverjetnimi 27 točkami in 12 pijačami že dodaja še žganje, ki ji prinaša dodatne 3 točke – ta ritem je neustavljiv! 💥 Gremo, ekipa Matija, Zoja, Dominik, do zmage! 🏆	3	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "drinkType": "MOSCOW_MULE", "streakCount": 6}	f	2025-09-19 21:43:49.527	\N
cmfrda363000jlb042dqmfotu	hype	"Inkarnacija borbenosti na našem odru! Zoja, s kar 27 točkami, je pripravljena, da prevzame kontrolu, medtem ko njena ekipa blesti s skupnimi 61 točkami! 🍻🔥 Sedaj, ko drži žganje v roki, se lahko pričakuje prava eksplozija točk! Poglejte jo, kako se pripravlja na nov izjemen met! Gremo, Zoja	2	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "trigger": "test_always"}	f	2025-09-19 21:43:57.58	\N
cmfrdf590000klb0402izrdpr	hype	In ta trenutek imamo pred seboj pravo spektakularno akcijo! Zoja je s svojo ekipo že dosegla impresivnih 27 točk in zdaj se pripravlja, da osvoji še dodatne točke s tistim požirekom žganja! 🥳🔥 Časa je vse manj, napetost narašča – kdo bo zmagal v tej nepozabni bitki za Pokal Šanka? 🏆	1	{"teamId": "cmfr8qfiw001bik04olw4x7ag", "userId": "cmfr8vdrs0002ky04ukw2zymo", "trigger": "random_hype"}	f	2025-09-19 21:47:53.463	\N
cmfrdf9zh000nlb04wwmemkp3	rank_jump	🚀 VELIKI SKOK za Matijo! 📈 Skočil je z 17. na 14. mesto in dokazal, da lahko žganje prinese presenečenje na "Pokal Šanka"! Prekašeni nasprotniki, poglejte se v ogledalo – Matija je na poti do vrha! 🥳	2	{"userId": "cmfr8yyqg000ll104sxm0hkut", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["RANK_JUMP"]}	f	2025-09-19 21:47:59.693	\N
cmfrdg4px0012lb04scj3l6pz	top_3_change	In neverjetnem preobratu je Zoja z osvežujočim žganjem priskočila na 3. mesto 🥉, medtem ko se Tajsss neusmiljeno seseda na 4. mesto! To je pravi boj za vrh, napetost se le še zaostruje! 💥🥂	4	{"userId": "cmfr8vdrs0002ky04ukw2zymo", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY", "TOP_3_EXIT"]}	f	2025-09-19 21:43:45.843	\N
cmfrdgsmp001blb04gjtjd6ar	hype	In zdaj gledamo Katharino, ki se pripravlja na svojo naslednjo potezo! Z 27 točkami in 12 popitimi pijačami je že prav blizu! 🎉 Ekipa Sasa žene vodi s kar 53 točkami, toda Katharina je pripravljena, da pokaže svojo moč! 💪🔥 Kaj bo prineslo to žganje? Le še dve točki in lahko preobrne igro! Navijajmo	2	{"teamId": "cmfr515sa000ajm04ge1solq1", "userId": "cmfr59jlr000qjm04rjfba2vx", "trigger": "test_always"}	f	2025-09-19 21:49:10.514	\N
cmfrdyfmp0004l204p5ht1h7r	hype	In zdaj, prijatelji, na odru imamo našega zvezdnika Tajsss-a! 🎉 S 23 točkami in 12 pijačami, ta fant res ve, kako se zabavati! 🥳 Ekipa SAŠA UDOVIČ WANNABE se še naprej bori z neverjetnimi 114 točkami, a Tajsss je pravkar vzel žganje in dodal +2 točki! 🚀 Dv	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr34sa90000ib04lr2ohjjz", "trigger": "test_always"}	f	2025-09-19 22:02:53.474	\N
cmfrdoj3u001glb04rhuvenjz	milestone	In kakšen trenutek! 🎉 Optimus Prime je pravkar dosegel neverjetnih 15 točk! 🥳 Za ekipo Kras United je to še en korak bližje zmagi, saj se s to zmago povečuje prednost na 45 točk! 🥃👊 #PokalŠanka	2	{"points": 15, "teamId": "cmfr6kpvw000bi104mydir0kt", "userId": "cmfr6kcxd000ai1045l249snz", "drinkType": "BEER_RADLER"}	f	2025-09-19 21:55:10.842	\N
cmfrdox5m001jlb04e6lf7449	hype	In še enkrat se razplamti energija na "Pokal Šanka"! 🔥 Optimus Prime z 15 točkami in 7 pijačami je na pravi poti, da popelje Kras United do zmage! 🏆 Zdaj, ko v roki drži žganje, se bo ta ekipa zagotovo dvignila na nove višave! 🍻 Poglejte to akcijo!	2	{"teamId": "cmfr6kpvw000bi104mydir0kt", "userId": "cmfr6kcxd000ai1045l249snz", "trigger": "test_always"}	f	2025-09-19 21:55:29.066	\N
cmfrdoy2f001mlb04etfurxai	milestone	Incredibilno! 🎉 Urosh je pravkar dosegel fantastičnih 35 točk! 🥳 S tem je ekipi SAŠA UDOVIČ WANNABE prinesel še dodatne žgane točke, kar jih popelje bližje do zmage! 🚀🍹	3	{"points": 35, "teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "JAGERMEISTER"}	f	2025-09-19 21:55:30.807	\N
cmfrdrniv001nlb04s47bbtkl	hype	In, in, in! Optimus Prime se podaja na pot do zmage! 🔥 S 15 točkami in 7 pijačami se pripravlja na naslednji požirek žganja, kar mu bo prineslo še dodatno točko! 💥 V ekipi Kras United, ki se brez težav približuje skupnim 45 točkam, bo ta trenutek odločilen! Kdo bo zmagovalec? Poglej	1	{"teamId": "cmfr6kpvw000bi104mydir0kt", "userId": "cmfr6kcxd000ai1045l249snz", "trigger": "random_hype"}	f	2025-09-19 21:57:37.02	\N
cmfrdrniw001olb0429ape93m	streak	🔥 Prijatelji, Urosh je na vrhuncu! Z natančnostjo šampiona in neverjetnim ritmom se spušča v ta izjemni niz z žganjem, ki ga dviga na nove višine! 🥃💥 S 35 točkami in 22 pijačami v žepu, ekipa SAŠA UDOVIČ WANNABE se resnično širi na vrh! 🚀	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "JAGERMEISTER", "streakCount": 4}	f	2025-09-19 21:57:37.02	\N
cmfrebgng001tlb04eekr7bb5	streak	🔥 Urosh je v polnem ritmu! Z vsakim požirkom žganja se približuje zmagi, trenutna energija in hitrost sta neustavljivi! 💥 Poglejte ga, kako prevzema nadzor s svojimi 39 točkami – SAŠA UDOVIČ WANNABE, to bo prava eksplozija! 🍻	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "JAGERMEISTER", "streakCount": 3}	f	2025-09-19 22:13:00.763	\N
cmfrecltc001ulb04py2zpn92	hype	In že smo nazaj! Urosh iz ekipe SAŠA UDOVIČ WANNABE trenutno blesti s 39 točkami in kar 24 popitimi pijačami! 🍻💥 Zdaj pa se pripravite, ker dviga žganje, ki mu prinaša dodatni dvig točk! 🔥 Kdo ve, morda bomo priča novemu rekordu! Let's go! 🏆🥳	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 22:13:54.388	\N
cmfredb2i001vlb04vyt5okkv	milestone	In nato, dragi gledalci, je tu trenutek, ki ga vsi čakamo! 🎉 Lozov napredek je eksplodiral do 20 točk, kar pomeni, da je ekipa Smokeye še korak bližje zmagi! 🥳 S 12 pijačami in trenutnim žganjem, ki prinaša dodatne 2 točki, je vzdušje neponovljivo! 🥃🔥	2	{"points": 20, "teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "drinkType": "MOJITO"}	f	2025-09-19 22:14:27.237	\N
cmfrelust001wlb0449vgz0kb	hype	In tu je, dragi gledalci! 🎉 Lozov pogum in neomajna moč se ponovno kaže! Z že 20 točkami in 12 zaužiti pijačami, se pripravlja, da ekipo Smokeye popelje do zmage! 🥳 Sedaj dviguje steklenico žganja, ki mu prinese dodatni 2 točki! Kdo ve, morda bo prav on zvezda večera	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "test_always"}	f	2025-09-19 22:15:08.54	\N
cmfrem2220004jv04vovpewvt	streak	🔥 Urosh je v pravačkem zagonu! Z 41 točkami in 26 pijačami se pripravlja na mitološki niz – 5 žgancev v samo 30 minutah! 🥃💪 Gremo, ekipa SAŠA UDOVIČ WANNABE, pokažite, kaj znate! 🚀✨	3	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "drinkType": "BEER_RADLER", "streakCount": 5}	f	2025-09-19 22:21:15.627	\N
cmfrem8gf0007jv04ny0ups7u	hype	In, in, in! Urosh se je ponovno potopil v akcijo in z vsako pijačo dviguje napetost! 💥 Z 41 točkami je tik pred tem, da svoj ekipi SAŠA UDOVIČ WANNABE prinese še dodatno prednost – žganje bo zagotovo prineslo več kot le točke! 🚀🥃 Gremo, Urosh, pokaži, kaj znaš!	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4ppcj0004jo04qpeiohzh", "trigger": "test_always"}	f	2025-09-19 22:21:23.356	\N
cmfremci70008jv04tzkbcq1y	hype	In štart! 🎉 Lozov trenutni rezultat je fenomenalnih 22 točk, s kar 13 popitimi pijačami! 🔥 Ekipa Smokeye s svojimi 52 točkami razbija vse rekorde, a sedaj je čas za akcijo - Lozo, vzemi to žganje in pokaži, kdo je pravi mojster pitja! 💪🥃🕺	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "test_always"}	f	2025-09-19 22:21:29.167	\N
cmfremcnh0009jv04aastm1y7	team_leadership	Incredible drama na "Pokal Šanka"! 🎉👑 Lozo je prevzel vodstvo v ekipi Smokeye z 24 točkami in prehitel Kicho za eno samo točko, medtem ko ekipa Smokeye s tem prehiteva Sasa žene na tretje mesto! 🏟️🏆 Kdo si upa napasti naslednje?	4	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 2, "trigger": "enhanced_individual", "changeTypes": ["TEAM_LEADERSHIP", "TEAM_OVERTAKE"]}	f	2025-09-19 22:21:29.168	\N
cmfreqlj5000ajv042lfsfw3o	hype	In tako, dragi gledalci, pred nami je Lozo, ki je s svojimi 22 točkami in 13 pijačami resnično zvezda tekmovanja! 💥🔥 Zdaj pije žganje in dviguje svojo ekipo Smokeye, ki se že bliža kar 52 točkam! Kaj vse še lahko doseže? Gremo, Lozo! 🍻🥳	1	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "random_hype"}	f	2025-09-19 22:24:47.397	\N
cmfrf844u0004jm04uet7glfz	milestone	Incredibilno! 🎉 paX je pravkar dosegel častitljivih 20 točk! 🍻 Z njegovim žganjem so SAŠA UDOVIČ WANNABE na pravi poti do zmage – s kar 121 točkami, kajne?! 🔥🥇	2	{"points": 20, "teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "drinkType": "BEER_RADLER"}	f	2025-09-19 22:38:24.751	\N
cmfrf8kaz0007jm043kn9xmeu	hype	In ekipa SAŠA UDOVIČ WANNABE je pravkar na vrhu! 🥳 paX, s fantastičnimi 20 točkami in 14 pijačami, je na pravi poti, da osvoji srce množice! 🔥 S trenutnim žganjem v roki, se pripravite na nepozaben trenutek – a kdo bo prvi presegel mejo? Poglejte to energijo in strast!	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "trigger": "test_always"}	f	2025-09-19 22:38:45.134	\N
cmfrfd3960009jm043jk1b61u	streak	🔥 Pripravite se, saj Lozo vznemirja igrišče s svojim neverjetnim tempom! 💥 Z 26 točkami in 15 pijačami se pripravlja, da z žganjem osvoji več točk in popelje Smokeye do zmage! 🥳🍻	3	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "drinkType": "AMARO", "streakCount": 4}	f	2025-09-19 22:42:16.797	\N
cmfrfd3950008jm04kmh6w3o4	team_event	🚀🔥 Ekipa SAŠA UDOVIČ WANNABE dosegla neverjetnih 121 točk! 🏆 PaX je s 20 točkami in 14 pijačami poskrbel za adrenalinski naboj, ko se je zavihtel na vrh z žganjem! 🍻💪 Ekipa, naprej po zmagi! 🥇✨	2	{"teamId": "cmfr34vw40001ib04uhl5pn11", "userId": "cmfr4xnlr0003l504mnluk06k", "teamPoints": 121}	f	2025-09-19 22:42:16.798	\N
cmfrfd3mc000cjm04u4yua75u	top_3_change	In neverjeten preobrat v boju za stopničke! 🎉 Lozo se je s svojimi dvema točkama za žganje izstrelil na 2. mesto 🥈 in presenetil vse – kdo bo še sledil njegovemu zmagovalnemu vzponu? 🔥💪	4	{"userId": "cmfr6vby90001ky04bzy935u3", "changes": 1, "trigger": "enhanced_individual", "changeTypes": ["TOP_3_ENTRY"]}	f	2025-09-19 22:42:16.799	\N
cmfrfd62u000djm04x0u80f12	hype	In zdaj imamo na prizorišču fenomenalnega Lozo, ki je s svojimi 26 točkami in kar 15 popitimi pijačami pokazal pravi duhovni boj! 🔥💪 Zdaj uživa v žganju in dodaja še tiste dragocene +2 točki, da bi ekipa Smokeye še bolj potisnila v vodstvo! 🍻🏆 Kdo ga bo ustavil? Vzdušje je	2	{"teamId": "cmfr61bom0002ju0493x2ax4k", "userId": "cmfr6vby90001ky04bzy935u3", "trigger": "test_always"}	f	2025-09-19 22:42:20.55	\N
\.


--
-- Data for Name: drink_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.drink_logs (id, "userId", "drinkType", points, "createdAt") FROM stdin;
cmfr4mvi00002l404pptvoqlf	cmfr4kxns0000l4041hif9ufo	JAGERMEISTER	2	2025-09-19 17:41:57.624
cmfr4qoph0001l504vqiekrev	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 17:44:55.445
cmfr4ropu0001jm047yjvqa3i	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 17:45:42.113
cmfr4ujh70003jm0498vuyxms	cmfr4kxns0000l4041hif9ufo	BEER_RADLER	1	2025-09-19 17:47:55.291
cmfr4zv540008jm04wrwc2eac	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 17:52:03.688
cmfr52d70000djm04h79uvosq	cmfr4z6u10004l504udjouaxy	MOJITO	2	2025-09-19 17:54:00.397
cmfr555fo000gjm04qslkv1xx	cmfr4wl5n0005jm04hv4w4epc	AUSTRIAN_SCHNAPS	2	2025-09-19 17:56:10.308
cmfr58oom000njm04bdykgnbi	cmfr4xnlr0003l504mnluk06k	AMARO	2	2025-09-19 17:58:55.222
cmfr59ihm000pjm04hgux3jbv	cmfr4z6u10004l504udjouaxy	AUSTRIAN_SCHNAPS	2	2025-09-19 17:59:33.851
cmfr5ba510006l504dx2ywuw6	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 18:00:56.341
cmfr5cogy0009l504ksxa8oy1	cmfr4kxns0000l4041hif9ufo	BEER_RADLER	1	2025-09-19 18:02:01.57
cmfr5cs33000bl504cqw0cpp4	cmfr4wl5n0005jm04hv4w4epc	BEER_RADLER	1	2025-09-19 18:02:06.255
cmfr5d5rw000tjm04il3kaxay	cmfr4wl5n0005jm04hv4w4epc	BEER_RADLER	1	2025-09-19 18:02:23.996
cmfr5dbaw000fl504pmyeggi9	cmfr59jlr000qjm04rjfba2vx	AUSTRIAN_SCHNAPS	2	2025-09-19 18:02:31.161
cmfr5dl00000il504o2c8j4ht	cmfr59jlr000qjm04rjfba2vx	MOSCOW_MULE	3	2025-09-19 18:02:43.729
cmfr5dsxp000ll504550avuhb	cmfr59jlr000qjm04rjfba2vx	MOSCOW_MULE	3	2025-09-19 18:02:54.014
cmfr5dtod000nl504ocq4e51z	cmfr34sa90000ib04lr2ohjjz	BEER_RADLER	1	2025-09-19 18:02:54.974
cmfr5o39l000rl50496r6tasz	cmfr5nh8s0000ju049ugavvcj	BEER_RADLER	1	2025-09-19 18:10:53.962
cmfr5t0x0000tl504gmo6268n	cmfr4kxns0000l4041hif9ufo	BEER_RADLER	1	2025-09-19 18:14:44.197
cmfr61pm50001le04jp5l4ue6	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 18:21:29.454
cmfr621d40003le04lvp54qwr	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 18:21:44.68
cmfr62fod0001l5047b5wel3o	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 18:22:03.229
cmfr67hcx0001l204hleywfit	cmfr66rlb0006le04agnslczw	MOSCOW_MULE	3	2025-09-19 18:25:58.689
cmfr68r0t0003l204jizzsvp4	cmfr4kxns0000l4041hif9ufo	JAGERMEISTER	2	2025-09-19 18:26:57.869
cmfr69fj70001i104qncj4jmj	cmfr60zip0001ju04bdvm726u	AMARO	2	2025-09-19 18:27:29.636
cmfr6av030001ie04sokc33kf	cmfr64pg10003l504bd6clu0s	PELINKOVAC	2	2025-09-19 18:28:36.339
cmfr6iuxk0001ik04mqruit2w	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 18:34:49.497
cmfr6iwht0003ik0439pkprjr	cmfr60zip0001ju04bdvm726u	MOJITO	2	2025-09-19 18:34:51.522
cmfr6nx730005l10431f2a4t8	cmfr6ksyb0000ky04l2z69bak	JAGERMEISTER	2	2025-09-19 18:38:45.712
cmfr6o5zt0007l104l12kj1ed	cmfr60zip0001ju04bdvm726u	AMARO	2	2025-09-19 18:38:57.114
cmfr6obmx000bl1045mdlf06m	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 18:39:04.425
cmfr6opx5000el104vsuokmtv	cmfr6k8bp0009i104v5au9ifv	JAGER_SHOT	2	2025-09-19 18:39:22.938
cmfr6ptkv000hl1041h40ssxf	cmfr4xnlr0003l504mnluk06k	AMARO	2	2025-09-19 18:40:14.335
cmfr6py8s000kl104wycy8b6z	cmfr4xnlr0003l504mnluk06k	AMARO	2	2025-09-19 18:40:20.38
cmfr6r4a2000nl104vd7tnxlx	cmfr59jlr000qjm04rjfba2vx	AUSTRIAN_SCHNAPS	2	2025-09-19 18:41:14.858
cmfr6uacd0009ik04t178itrn	cmfr6kcxd000ai1045l249snz	JAGER_SHOT	2	2025-09-19 18:43:42.685
cmfr6v725000di104xde244n8	cmfr34sa90000ib04lr2ohjjz	AMARO	2	2025-09-19 18:44:25.085
cmfr6vvbh000cik04f3id5bba	cmfr6m6c90007ik04qfs8z3b2	JAGERMEISTER	2	2025-09-19 18:44:56.525
cmfr6vy6f000fik04s8zipr1q	cmfr6vby90001ky04bzy935u3	BEER_RADLER	1	2025-09-19 18:45:00.231
cmfr6xlsk000ki104us1taj6c	cmfr5nh8s0000ju049ugavvcj	BEER_RADLER	1	2025-09-19 18:46:17.493
cmfr6yarq000ni104e5ebl1vm	cmfr6kcxd000ai1045l249snz	BEER_RADLER	1	2025-09-19 18:46:49.863
cmfr6z0zt000qi104nsw0v3kk	cmfr6k8bp0009i104v5au9ifv	BEER_RADLER	1	2025-09-19 18:47:23.849
cmfr70422000ti1049ny40a4y	cmfr6ksyb0000ky04l2z69bak	BEER_RADLER	1	2025-09-19 18:48:14.474
cmfr72qr1000jik0477wr04s4	cmfr66rlb0006le04agnslczw	MOJITO	2	2025-09-19 18:50:17.198
cmfr77i7y000wi104gy7mzj3e	cmfr5nh8s0000ju049ugavvcj	AMARO	2	2025-09-19 18:53:59.422
cmfr781sd000yi104drzmt86o	cmfr60zip0001ju04bdvm726u	AMARO	2	2025-09-19 18:54:24.782
cmfr7bxuf0003ky041eve8cg1	cmfr7bh9v000pl104hm0a3n8l	MOJITO	2	2025-09-19 18:57:26.296
cmfr7c6a30005ky04x1sg0uh1	cmfr7bh9v000pl104hm0a3n8l	MOSCOW_MULE	3	2025-09-19 18:57:37.228
cmfr7dyx60012i104gubo31yz	cmfr6kcxd000ai1045l249snz	AMARO	2	2025-09-19 18:59:01.002
cmfr7e1mi0017i104lxkxf67h	cmfr6k8bp0009i104v5au9ifv	BEER_RADLER	1	2025-09-19 18:59:04.506
cmfr7e64n001ai104oo6ej7u5	cmfr6wigd000hik04bbsyzlg8	SPARKLING_WINE	2	2025-09-19 18:59:10.344
cmfr7f8mf001ci1046a4t0uk8	cmfr6m6c90007ik04qfs8z3b2	BEER_RADLER	1	2025-09-19 19:00:00.232
cmfr7gjhj001fi104w6ar9oa0	cmfr60zip0001ju04bdvm726u	MOSCOW_MULE	3	2025-09-19 19:01:00.968
cmfr7j937000oik044l39wkgj	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 19:03:07.46
cmfr7kx61001ji104tash4rvp	cmfr6wigd000hik04bbsyzlg8	BEER_RADLER	1	2025-09-19 19:04:25.321
cmfr7o0ce000uik04u6atc1xj	cmfr4z6u10004l504udjouaxy	MOJITO	2	2025-09-19 19:06:49.407
cmfr7oi7c000rl10466e1q8ei	cmfr7bh9v000pl104hm0a3n8l	MOJITO	2	2025-09-19 19:07:12.552
cmfr7q90h000ul104ehg6sksi	cmfr6vby90001ky04bzy935u3	AUSTRIAN_SCHNAPS	2	2025-09-19 19:08:33.953
cmfr7wvcs001mi104serbk257	cmfr5nh8s0000ju049ugavvcj	BEER_RADLER	1	2025-09-19 19:13:42.844
cmfr7xrq8000xik043dlwatkc	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 19:14:24.801
cmfr815fl0012ik04y37zstdk	cmfr60zip0001ju04bdvm726u	AMARO	2	2025-09-19 19:17:02.529
cmfr81od8001pi104uevumlqx	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 19:17:27.069
cmfr82pdo0009ky04q1jn3bzg	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 19:18:15.037
cmfr82qey000bky04oaqko2t1	cmfr6kcxd000ai1045l249snz	MOSCOW_MULE	3	2025-09-19 19:18:16.378
cmfr82sea000eky04qqvaq1ve	cmfr6k8bp0009i104v5au9ifv	MOSCOW_MULE	3	2025-09-19 19:18:18.947
cmfr83v61000xl104xepkw4ze	cmfr4kxns0000l4041hif9ufo	BEER_RADLER	1	2025-09-19 19:19:09.194
cmfr8484g000zl104op7dvn74	cmfr6ksyb0000ky04l2z69bak	MOSCOW_MULE	3	2025-09-19 19:19:25.985
cmfr8ae6y0001jl04f75z4172	cmfr6vby90001ky04bzy935u3	BEER_RADLER	1	2025-09-19 19:24:13.786
cmfr8kzjh0018ik046lqzvgoi	cmfr4kxns0000l4041hif9ufo	JAGERMEISTER	2	2025-09-19 19:32:28.013
cmfr8r9gl0003jl04sek2sob4	cmfr7bh9v000pl104hm0a3n8l	MOSCOW_MULE	3	2025-09-19 19:37:20.805
cmfr8s8t00001l104pu361o91	cmfr8q0jz001aik04xmv2ii8z	AMARO	2	2025-09-19 19:38:06.612
cmfr8sflh0003l104r9behutd	cmfr8q0jz001aik04xmv2ii8z	AMARO	2	2025-09-19 19:38:15.413
cmfr8sh6t0006l1043mahizsb	cmfr8q0jz001aik04xmv2ii8z	AMARO	2	2025-09-19 19:38:17.478
cmfr8t1g6000al104opxrgbut	cmfr8q0jz001aik04xmv2ii8z	MOSCOW_MULE	3	2025-09-19 19:38:43.734
cmfr8v4yv0001ky042cke5ndg	cmfr8uiwz0000jl04wvrscqzf	MOSCOW_MULE	3	2025-09-19 19:40:21.607
cmfr8wap40005ky04djxkfvlr	cmfr8vdrs0002ky04ukw2zymo	MOSCOW_MULE	3	2025-09-19 19:41:15.689
cmfr94ejq0003jo04ojesuf23	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 19:47:33.926
cmfr9n7uw000fl104rph2d8g9	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 20:02:11.72
cmfr9shh1000kl104gsx935vs	cmfr4wl5n0005jm04hv4w4epc	BEER_RADLER	1	2025-09-19 20:06:17.462
cmfra81zj000cl404ufybocmb	cmfr8yyqg000ll104sxm0hkut	JAGERMEISTER	2	2025-09-19 20:18:23.888
cmfra85p7000el404or6h4g14	cmfr6ksyb0000ky04l2z69bak	MOSCOW_MULE	3	2025-09-19 20:18:28.699
cmfra8bcz000ol4049zafa8ku	cmfr4z6u10004l504udjouaxy	AUSTRIAN_SCHNAPS	2	2025-09-19 20:18:36.035
cmfr8wkil0008ky04xqwq0er1	cmfr8vdrs0002ky04ukw2zymo	AMARO	2	2025-09-19 19:41:28.413
cmfr8x860000bky04z4goiiom	cmfr8vdrs0002ky04ukw2zymo	AMARO	2	2025-09-19 19:41:59.064
cmfr8znif000eky04we3aepuj	cmfr8yyqg000ll104sxm0hkut	MOSCOW_MULE	3	2025-09-19 19:43:52.264
cmfr946qw0001jo0445win378	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 19:47:23.816
cmfr8zbo2001dik04evojxnig	cmfr8uiwz0000jl04wvrscqzf	AMARO	2	2025-09-19 19:43:36.915
cmfr922tk000hky04cqdmerk1	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 19:45:45.417
cmfr92edy000jky042vyzxxm5	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 19:46:00.315
cmfr9gdho0005la04ps8oh1do	cmfr8q0jz001aik04xmv2ii8z	AMARO	2	2025-09-19 19:56:52.428
cmfr9z49l000hjo04jl1j02mm	cmfr59jlr000qjm04rjfba2vx	AMARO	2	2025-09-19 20:11:26.938
cmfr9zan4001cl1040gbep6te	cmfr59jlr000qjm04rjfba2vx	AMARO	2	2025-09-19 20:11:35.2
cmfr9zg1g001fl104pzt26484	cmfr59jlr000qjm04rjfba2vx	ESPRESSO_MARTINI	3	2025-09-19 20:11:42.196
cmfr9760o0007jo04ycegu34c	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 19:49:42.841
cmfr98mxn0009jo04c3svv9g3	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 19:50:51.42
cmfr98wq4000cjo043f8cz6vm	cmfr4kxns0000l4041hif9ufo	BEER_RADLER	1	2025-09-19 19:51:04.108
cmfr9booy0001l404nd29bifc	cmfr59jlr000qjm04rjfba2vx	AMARO	2	2025-09-19 19:53:13.666
cmfr9bvfz0003l4041nr53f1t	cmfr59jlr000qjm04rjfba2vx	AUSTRIAN_SCHNAPS	2	2025-09-19 19:53:22.416
cmfr9gbsn0003la04zdcwgs5e	cmfr8vdrs0002ky04ukw2zymo	AMARO	2	2025-09-19 19:56:50.232
cmfr9gkef0001l104mw79rl6f	cmfr34sa90000ib04lr2ohjjz	AMARO	2	2025-09-19 19:57:01.383
cmfr9h5us0008l1047guo5jlo	cmfr5nh8s0000ju049ugavvcj	AMARO	2	2025-09-19 19:57:29.188
cmfr9szjn000ml104vmpirgkq	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 20:06:40.883
cmfr9t5n2000pl104ept73ehq	cmfr6vby90001ky04bzy935u3	BEER_RADLER	1	2025-09-19 20:06:48.783
cmfr9tarf000vl104si37qge3	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 20:06:55.42
cmfr9uehl000yl104bn6q3ggj	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 20:07:46.905
cmfr9x07i0018l104eullb1qa	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 20:09:48.366
cmfra1bmv0001l204u31v9zky	cmfr6k8bp0009i104v5au9ifv	AMARO	2	2025-09-19 20:13:09.799
cmfra7ti50007l4049qqll9w9	cmfra2kbm0003l204769m6hui	VODKA	2	2025-09-19 20:18:12.893
cmfra85p7000gl404cf211asm	cmfr6kcxd000ai1045l249snz	MOSCOW_MULE	3	2025-09-19 20:18:28.7
cmfra864v000jl404skbfv2gj	cmfr6k8bp0009i104v5au9ifv	MOSCOW_MULE	3	2025-09-19 20:18:28.7
cmfra9g83000kjo04gp2jqdku	cmfr7bh9v000pl104hm0a3n8l	JAGER_SHOT	2	2025-09-19 20:19:28.996
cmfra9p8g000rl404ep6bd248	cmfra2kbm0003l204769m6hui	GIN	2	2025-09-19 20:19:40.672
cmfraco17000ul404itr4hwkh	cmfra2kbm0003l204769m6hui	VODKA	2	2025-09-19 20:21:59.083
cmfradyq1001jl104osqvu98u	cmfr8vdrs0002ky04ukw2zymo	MOSCOW_MULE	3	2025-09-19 20:22:59.593
cmfrae78b001ll10439kv735y	cmfr8q0jz001aik04xmv2ii8z	GIN	2	2025-09-19 20:23:10.619
cmfrae8da001ol104d0zrpbl6	cmfr8yyqg000ll104sxm0hkut	MOSCOW_MULE	3	2025-09-19 20:23:12.094
cmfraej0y001sl104dnmbhie9	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 20:23:25.906
cmfraetqz000njo04fdh6taap	cmfr8uiwz0000jl04wvrscqzf	MOSCOW_MULE	3	2025-09-19 20:23:39.803
cmfrag6bn000qjo049xaex4c3	cmfr8vdrs0002ky04ukw2zymo	AMARO	2	2025-09-19 20:24:42.756
cmfrak0rn000zl40457qkq4y4	cmfr60zip0001ju04bdvm726u	MOSCOW_MULE	3	2025-09-19 20:27:42.179
cmfralu98001vl104slmlqu8v	cmfr6vby90001ky04bzy935u3	PELINKOVAC	2	2025-09-19 20:29:07.053
cmfrantd3000ela04od5uxikw	cmfr60zip0001ju04bdvm726u	AMARO	2	2025-09-19 20:30:39.207
cmfraojh5000gla04jv1r7sox	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 20:31:13.049
cmfrb1v9f000mla04j8d6xnh4	cmfr4z6u10004l504udjouaxy	MOSCOW_MULE	3	2025-09-19 20:41:34.851
cmfrb4h2v000tla04f7c57pkb	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 20:43:36.44
cmfrb5j2a0001l2044lebdbi3	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 20:44:25.666
cmfrb895t0001l104q3uvgbg2	cmfr6vby90001ky04bzy935u3	VODKA	2	2025-09-19 20:46:32.802
cmfrb8szy0001l704lc46brab	cmfr4xnlr0003l504mnluk06k	AMARO	2	2025-09-19 20:46:58.511
cmfrb8t070003l7049y5zjni4	cmfr5nh8s0000ju049ugavvcj	AMARO	2	2025-09-19 20:46:58.52
cmfrb8v5b0006l704wtjonc8p	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 20:47:01.296
cmfrb9348000al7045q9tpxsu	cmfr4xnlr0003l504mnluk06k	AMARO	2	2025-09-19 20:47:11.625
cmfrbavr1000cl704jdrn73rh	cmfr5nh8s0000ju049ugavvcj	AMARO	2	2025-09-19 20:48:35.39
cmfrbbwaj000gl7049bikhz90	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 20:49:22.748
cmfrbd96e000kl704jywt8hnn	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 20:50:26.103
cmfrbdei7000nl704rw2i6bls	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 20:50:33.007
cmfrbdh6y000ql704511b4ews	cmfr4kxns0000l4041hif9ufo	JAGERMEISTER	2	2025-09-19 20:50:36.49
cmfrbea260005l104dag5wirp	cmfr59jlr000qjm04rjfba2vx	AMARO	2	2025-09-19 20:51:13.902
cmfrbl49p000tl704o8aagaw9	cmfr6vby90001ky04bzy935u3	BEER_RADLER	1	2025-09-19 20:56:32.989
cmfrbodae0001kz04z4g0u86d	cmfr8q0jz001aik04xmv2ii8z	AMARO	2	2025-09-19 20:59:04.647
cmfrbrr2r0001l404wqglx6dt	cmfr4xnlr0003l504mnluk06k	AMARO	2	2025-09-19 21:01:42.483
cmfrbsv830005l4049q3bhl6l	cmfr6kcxd000ai1045l249snz	MOSCOW_MULE	3	2025-09-19 21:02:34.515
cmfrbzf3l0001l204z4486nb5	cmfr4kxns0000l4041hif9ufo	BEER_RADLER	1	2025-09-19 21:07:40.209
cmfrc4kc8000el404n8sbex9j	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 21:11:40.281
cmfrc4ph9000gl404ha44qju9	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 21:11:46.941
cmfrc5ufo000jl4045okio2y9	cmfr60zip0001ju04bdvm726u	AMARO	2	2025-09-19 21:12:40.02
cmfrc79aj0003l204to5i86zw	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 21:13:45.931
cmfrc9eks0008l204xa47b4aj	cmfr5nh8s0000ju049ugavvcj	AMARO	2	2025-09-19 21:15:26.092
cmfrchqf50003lb043i6ads52	cmfr4ppcj0004jo04qpeiohzh	PELINKOVAC	2	2025-09-19 21:21:54.689
cmfrcmwwo0005lb04ezc9x33s	cmfr4ppcj0004jo04qpeiohzh	PELINKOVAC	2	2025-09-19 21:25:56.376
cmfrcn79e0009lb04v360bajh	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 21:26:09.795
cmfrcnds5000dlb04gtulu9l5	cmfr5nh8s0000ju049ugavvcj	AMARO	2	2025-09-19 21:26:18.246
cmfrcw79m000hlb04ccpxjgiz	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 21:33:09.706
cmfrd0thj000jlb04867mx4rf	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 21:36:45.128
cmfrd5fdj000vlb04xijc3l62	cmfr8uiwz0000jl04wvrscqzf	MOSCOW_MULE	3	2025-09-19 21:40:20.12
cmfrd83sc000xlb04hysbt6wd	cmfr8vdrs0002ky04ukw2zymo	AMARO	2	2025-09-19 21:42:25.069
cmfrd8jci0001lb04od479hp2	cmfr8vdrs0002ky04ukw2zymo	AMARO	2	2025-09-19 21:42:45.234
cmfrd8zjw0003lb0460uo2mcu	cmfr8vdrs0002ky04ukw2zymo	PELINKOVAC	2	2025-09-19 21:43:06.236
cmfrd92vw0011lb04lll9gi8m	cmfr8vdrs0002ky04ukw2zymo	PELINKOVAC	2	2025-09-19 21:43:10.557
cmfrd93g50006lb04ygygo4de	cmfr5nh8s0000ju049ugavvcj	BEER_RADLER	1	2025-09-19 21:43:11.286
cmfrd9i1i000blb0402xf5umq	cmfr8vdrs0002ky04ukw2zymo	PELINKOVAC	2	2025-09-19 21:43:30.198
cmfrd9nzm000elb04gbqw02xi	cmfr8vdrs0002ky04ukw2zymo	MOSCOW_MULE	3	2025-09-19 21:43:37.907
cmfrdf64e000mlb04fauj6b86	cmfr8yyqg000ll104sxm0hkut	MOSCOW_MULE	3	2025-09-19 21:47:54.686
cmfrdgeyl0014lb04dsfpne6q	cmfr60zip0001ju04bdvm726u	MOSCOW_MULE	3	2025-09-19 21:48:52.798
cmfrdgk360017lb04y83fpc1i	cmfr59jlr000qjm04rjfba2vx	JAGERMEISTER	2	2025-09-19 21:48:59.443
cmfrdgp9j001alb04rzgjw6tf	cmfr59jlr000qjm04rjfba2vx	PELINKOVAC	2	2025-09-19 21:49:06.151
cmfrdiloc001dlb0426fhogl5	cmfr6kcxd000ai1045l249snz	BEER_RADLER	1	2025-09-19 21:50:34.812
cmfrdojlw001ilb043iq1asoo	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 21:55:12.068
cmfrdoxag001llb04fam6buno	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 21:55:29.8
cmfrdy7nb0001l2048oufcok4	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 22:02:43.128
cmfrdyesf0003l204x34srgr0	cmfr34sa90000ib04lr2ohjjz	JAGERMEISTER	2	2025-09-19 22:02:52.384
cmfre5122001qlb04tmgxqgz4	cmfr4ppcj0004jo04qpeiohzh	JAGERMEISTER	2	2025-09-19 22:08:01.178
cmfrebfzf001slb04t0rj7ekc	cmfr6vby90001ky04bzy935u3	MOJITO	2	2025-09-19 22:13:00.459
cmfreiue50001jx0400xcbzzi	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 22:18:45.726
cmfrelx5n0001jv04cda8l0fe	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 22:21:09.276
cmfrem19t0003jv04atx2ohtx	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 22:21:14.609
cmfrem8dt0006jv04pzhgdn4b	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 22:21:23.732
cmfrf7vx90001jm0482vscvov	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 22:38:14.109
cmfrf83lp0003jm04oub07724	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 22:38:24.062
cmfrf8k8h0006jm04u30wstdx	cmfr6vby90001ky04bzy935u3	AMARO	2	2025-09-19 22:38:45.618
cmfrfd3jq000bjm04u5uhkmvm	cmfr4xnlr0003l504mnluk06k	BEER_RADLER	1	2025-09-19 22:42:17.27
cmfrg7cl40001l504qpv5s9y1	cmfr4ppcj0004jo04qpeiohzh	BEER_RADLER	1	2025-09-19 23:05:48.665
cmfrgqgr50001jl04gvtapqmi	cmfr5nh8s0000ju049ugavvcj	BEER_RADLER	1	2025-09-19 23:20:40.529
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.posts (id, "userId", message, image_url, "createdAt") FROM stdin;
cmfr4nfyn0001jo042byyg5bw	cmfr4kxns0000l4041hif9ufo	Akcija	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758303740127-aieRripLbRrXPnKfrAjfZM1GPY6HQv.jpeg	2025-09-19 17:42:24.143
cmfr4nh140003jo04ewlum755	cmfr4kxns0000l4041hif9ufo	Akcija	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758303741585-zyDXQaXm08RyI8S8QYLneyeflZRKqK.jpeg	2025-09-19 17:42:25.529
cmfr575p9000ijm0420uzc9pb	cmfr4z6u10004l504udjouaxy	Cheers	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758304660737-4mmsRhKtFG0Y5nMIkeb4C0XjeDWlsM.jpeg	2025-09-19 17:57:43.965
cmfr576qg000ljm04zzkpory8	cmfr4z6u10004l504udjouaxy	Cheers	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758304662804-qDxPpWAvr03Yl1FIMEdGM0QZOTi4jv.jpeg	2025-09-19 17:57:45.304
cmfr69n0p0004i104veq1zmyl	cmfr60zip0001ju04bdvm726u	Uvodna pijača Amaro	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758306455243-FIm63vk9LGIdIvsr8gF62mEWhqHxQh.jpeg	2025-09-19 18:27:39.337
cmfr69nn40006i104bwkhz9r8	cmfr60zip0001ju04bdvm726u	Uvodna pijača Amaro	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758306456606-1T1SYznUQtQ0wyfMBXBJz19kmBuxWc.jpeg	2025-09-19 18:27:40.144
cmfr6a3f90008i104rcerd9cl	cmfr60zip0001ju04bdvm726u	Uvodna pijača Amaro	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758306476886-lRdHS4p2uBc7bK46V73y1nr8Gtd5DM.jpeg	2025-09-19 18:28:00.597
cmfr6lssw0001l1044seru6cl	cmfr6kcxd000ai1045l249snz	Zaenkrat ogrevajne pred tekmo	\N	2025-09-19 18:37:06.704
cmfr6lx770003l104zd18f013	cmfr6kcxd000ai1045l249snz	Zaenkrat ogrevajne pred tekmo	\N	2025-09-19 18:37:12.403
cmfr6xk26000gi104b40bqn0d	cmfr5nh8s0000ju049ugavvcj	👌🏼👌🏼	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758307570720-frptilKPguHf9vLW56BUHpai6TaPqK.jpeg	2025-09-19 18:46:15.247
cmfr6xkrt000ii104gm4nprm2	cmfr5nh8s0000ju049ugavvcj	👌🏼👌🏼	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758307574158-CS0fMx6tbcISdt6CtCDTHX4RJoAB1Y.jpeg	2025-09-19 18:46:16.169
cmfr76nxk000mik04k0t2p2e8	cmfr66rlb0006le04agnslczw	🍺🍷🥂🍾	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758307996626-9hDqQgtIutFJYFPTiTPbi92NQJQsTo.jpeg	2025-09-19 18:53:20.168
cmfr7e0140014i104tbgehjyd	cmfr6k8bp0009i104v5au9ifv	Mrax vozi , Rolli bo pijan.	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758308339369-dmmFmSyQmv2HB5B0T6SutQQ9gkD4w5.jpeg	2025-09-19 18:59:02.441
cmfr7kldo000qik04icphits9	cmfr6k8bp0009i104v5au9ifv	Mrax vozi , Rolli bo pijan.	\N	2025-09-19 19:04:10.045
cmfr809u0000zik04sm9gf3sn	cmfr5nh8s0000ju049ugavvcj	👌🏼	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758309377661-zVpZOqWrR66ni6qQSvMkoh07okgKXt.jpeg	2025-09-19 19:16:21.577
cmfr8uaio000dl104w7gdbd3y	cmfr8q0jz001aik04xmv2ii8z	Slabo smo zacel, pa se slabs koncal	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758310778514-fSyxqstHcnoJPcHpValGkmiEStkK8c.jpeg	2025-09-19 19:39:42.145
cmfr8uaya000fl104sxks0pdj	cmfr8q0jz001aik04xmv2ii8z	Slabo smo zacel, pa se slabs koncal	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758310779451-0YoWLNThsFvSJAQw8B1QQfBuFzfKrm.jpeg	2025-09-19 19:39:42.706
cmfr8ubeh000hl104231c2qq5	cmfr8q0jz001aik04xmv2ii8z	Slabo smo zacel, pa se slabs koncal	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758310781617-AVAnZw4RGtH5GrCUYKec15RyCf2YLU.jpeg	2025-09-19 19:39:43.29
cmfr8yanc000kl104mleluvcb	cmfr8uiwz0000jl04wvrscqzf	Kukaj	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758310967143-Q8Icm7PYLcbyyHMzKCvzPu03k25UTb.jpeg	2025-09-19 19:42:48.936
cmfr9cfu10001la04f3byxqw1	cmfr4ppcj0004jo04qpeiohzh	😎💥🚀	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758311626667-uZqsWOkW79VVTc6hr5yBNHOt1I8lbR.jpeg	2025-09-19 19:53:48.841
cmfr9h3z40004l104wr40swfg	cmfr8q0jz001aik04xmv2ii8z	❤️	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758311844640-YzMwNwymBwp9b1gpePzyQ8QsyPQE5j.jpeg	2025-09-19 19:57:26.752
cmfr9h4hs0006l104x1kenptx	cmfr8q0jz001aik04xmv2ii8z	❤️	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758311843072-j7K3dnSpaqe3wA5jyrDs6gwIAp2PRK.jpeg	2025-09-19 19:57:27.424
cmfr9h6s9000al104afcw614b	cmfr8q0jz001aik04xmv2ii8z	❤️	\N	2025-09-19 19:57:30.394
cmfr9iqna000dl104vpadkm6c	cmfr8q0jz001aik04xmv2ii8z	.	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758311920673-zrWa4I8Cjlc2UNAe1ISTpHpjs8uYSp.jpeg	2025-09-19 19:58:42.79
cmfr9pzde000il10466fvk796	cmfr4kxns0000l4041hif9ufo	Vamoss	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758312257327-GC4Zh2sN0PDITiMZrB2dAeaiEgu0bG.jpeg	2025-09-19 20:04:20.69
cmfr9t9sz000tl10418njhecu	cmfr4wl5n0005jm04hv4w4epc	5kg kebab	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758312412089-0lzBI700cIXlkLZwfKIf8ELaS6dJNQ.jpeg	2025-09-19 20:06:54.179
cmfr9wnbf0012l10492ozlacz	cmfr6vby90001ky04bzy935u3	Party like a balkan!	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758312569954-fYb4yQnah9VSKYD6jRqiWba0v2veFR.jpeg	2025-09-19 20:09:31.66
cmfr9wo1q0014l104l226vqv6	cmfr6vby90001ky04bzy935u3	Party like a balkan!	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758312571449-bBm0fTFqXGziDAEVXLDW150KAtEBjf.jpeg	2025-09-19 20:09:32.606
cmfra3oh6000ala04xchnw6op	cmfra2kbm0003l204769m6hui	Cara	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758312896785-4Hw3avd69dcbyImyXERhYXqEl5FhVq.jpeg	2025-09-19 20:14:59.754
cmfra3p95000cla04ql0favza	cmfra2kbm0003l204769m6hui	Cara	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758312897973-Q1f8bdbRyuXcDr82h3bAycEfMcHrQb.jpeg	2025-09-19 20:15:00.762
cmfra7yv4000al404r6w5p1r0	cmfr6vby90001ky04bzy935u3	Štrijo porkodijo 🤣	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758313097749-aUdqSwxIL06Gqu7Li7gTLqMLMLI97r.jpeg	2025-09-19 20:18:19.841
cmfra8a2v000ml404mjc48pa6	cmfr8q0jz001aik04xmv2ii8z	Glavna	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758313110600-aWfpnR97oPsnwrc00ROqWrdpj7SOaC.jpeg	2025-09-19 20:18:34.375
cmfrahzzz000xl404c5t6yn5h	cmfr4kxns0000l4041hif9ufo	Vamossklozo	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758313564127-TxknOTwMKRYoz3LTf4v3Zeg0ROOsrE.jpeg	2025-09-19 20:26:07.871
cmfraze7o000jla04v3mb5i6k	cmfr4kxns0000l4041hif9ufo	Pojemooo	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314375366-DVzoKPeXIKjJHPpjxnPLoVOeGkMiqQ.jpeg	2025-09-19 20:39:39.444
cmfrb347w000pla0425aafwp1	cmfr4kxns0000l4041hif9ufo	A	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314549517-jK8NM40CRwCKmipEaO2nTnfVlQoRPe.jpeg	2025-09-19 20:42:33.117
cmfrb34sm000rla045fk7f99q	cmfr4kxns0000l4041hif9ufo	A	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314551379-nRVO2Acl1vxDzSf739QW6m9YHGTl3O.jpeg	2025-09-19 20:42:33.863
cmfrb6spk0004l204af38nenw	cmfr4kxns0000l4041hif9ufo	Sasee	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314721684-tyimwpFBmBrslUlebsuSQv1MFE0Tt7.jpeg	2025-09-19 20:45:24.825
cmfrb6taw0006l204yez2r2wj	cmfr4kxns0000l4041hif9ufo	Sasee	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314722911-cpPggEai6GjyzUUKGjr7JRepz14Sfi.jpeg	2025-09-19 20:45:25.593
cmfrb6u8o0008l2045etz0fbv	cmfr4kxns0000l4041hif9ufo	Sasee	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314724051-X0tiULG3VWd2cNfbIDUV0RPCaKMN87.jpeg	2025-09-19 20:45:26.808
cmfrb7twb0001jo04d613wcy2	cmfr34sa90000ib04lr2ohjjz	Lozo gre all in	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758314769483-qEk0Sa45qGfo782DpdzrzuW8cuAxz1.jpeg	2025-09-19 20:46:13.019
cmfrbu71h0008l404jthrhg84	cmfr34sa90000ib04lr2ohjjz	Jenas	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315812521-KdnTkJ1gDy6tXL4myxK1lis3JvLDsU.jpeg	2025-09-19 21:03:36.486
cmfrbu7uf000al404xy78wbpo	cmfr34sa90000ib04lr2ohjjz	Jenas	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315815075-zmob4nf8zGt3PdPRHuR1oMLTmlNQrU.jpeg	2025-09-19 21:03:37.528
cmfrbv9px0001l504f60u5vjc	cmfr34sa90000ib04lr2ohjjz	Pips	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315863584-uDPO30w61ZV6XRJAevchCF1lM5ktT8.jpeg	2025-09-19 21:04:26.614
cmfrbvaqr0003l504r6pbqbcc	cmfr34sa90000ib04lr2ohjjz	Pips	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315864576-y3aeH2bpei3AAMf7b9vQdK4o5yHi0y.jpeg	2025-09-19 21:04:27.94
cmfrbw71n0005l504o36bn88b	cmfr34sa90000ib04lr2ohjjz	Gliser	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315906990-7Ik6J2ucMC4vifBs8fq8N1iwcvrVnj.jpeg	2025-09-19 21:05:09.804
cmfrbw7hs0007l504keq06qmx	cmfr34sa90000ib04lr2ohjjz	Gliser	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315907763-fzrlvd0HnEZ4XgFDSoMSpCUpOaLhnT.jpeg	2025-09-19 21:05:10.384
cmfrbw7vg0009l5043pl4vq4v	cmfr34sa90000ib04lr2ohjjz	Gliser	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315908486-iH59Nnel5WoSucXzRGFLItroeJOyif.jpeg	2025-09-19 21:05:10.877
cmfrbx9e4000cl4048did9t6o	cmfr34sa90000ib04lr2ohjjz	Pax	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315956823-mt7yuZpj5Tb4nUBiqcQ7yOr9ZYzGB0.jpeg	2025-09-19 21:05:59.5
cmfrbxwiq0004kz04koqixm1a	cmfr34sa90000ib04lr2ohjjz	Bwsk	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315987174-VOTp2YfoIDI7XPOnBGdiqA3Gnqk9GF.jpeg	2025-09-19 21:06:29.475
cmfrbxxjn0006kz048ig3v5fo	cmfr34sa90000ib04lr2ohjjz	Bwsk	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758315988293-7Si67TJGAzDJ3AfAfd5uiLO8I7Ynpn.jpeg	2025-09-19 21:06:30.803
cmfrc94c10006l204v56091d6	cmfr4ppcj0004jo04qpeiohzh	Hellooooo	\N	2025-09-19 21:15:12.817
cmfrcd8v9000pl4041p826z7q	cmfr4ppcj0004jo04qpeiohzh	Hellooooo	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758316702172-QKCOTyufHgznn0J3yphVYzVHF480kl.jpeg	2025-09-19 21:18:25.317
cmfrchq6g0001lb04tfwugqu0	cmfr5nh8s0000ju049ugavvcj	👌🏼	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758316909939-ZHrHFJq1hJIbWBKqx76tAgMYVlSjZp.jpeg	2025-09-19 21:21:54.376
cmfrd52hp000nlb049hzoojrd	cmfr8q0jz001aik04xmv2ii8z	Ja	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758317997325-5XqJR98k5pPvUp6l8PAxbeX0fIIWuw.jpeg	2025-09-19 21:40:03.422
cmfrd532i000plb041py8cm1n	cmfr8q0jz001aik04xmv2ii8z	Ja	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758317999548-rGvoVRBpMNZyRsvPtOxYubOwbJCan3.jpeg	2025-09-19 21:40:04.171
cmfrd53hz000rlb04f8zfv68i	cmfr8q0jz001aik04xmv2ii8z	Ja	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758317998285-eZkKhg1o7XPX6XmzopeaS9YONvwkom.jpeg	2025-09-19 21:40:04.728
cmfrdm9dn001flb04y5mqywvg	cmfr8q0jz001aik04xmv2ii8z	Ja	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758318802337-y8AW6T2ABKmq2E8ZsA0xgNgOVyirhf.jpeg	2025-09-19 21:53:25.5
cmfreqloh000cjv04qj4xozg7	cmfr4ppcj0004jo04qpeiohzh	Streeeeiiiittttt tooo	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758320685533-EJQPySUo3CaUdTGcGDNRxv38KzVdO9.jpeg	2025-09-19 22:24:47.681
cmfrfpiob0001kz04pk22rebv	cmfr4kxns0000l4041hif9ufo	Hvala za vse, gremo daljee	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758322313681-wqFI5wRefWjFOAH9uWBtdyO7Gfcegv.jpeg	2025-09-19 22:51:56.748
cmfrfpjgn0003kz043ry4wyd7	cmfr4kxns0000l4041hif9ufo	Hvala za vse, gremo daljee	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758322315657-7UKDVa0pRoITSPSDDQ2CbZ7zTAKpXn.jpeg	2025-09-19 22:51:57.767
cmfrfv89j0001ib04n6ixqel1	cmfr4ppcj0004jo04qpeiohzh	😎😎👍🚀💥	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/compressed-1758322580359-EejrCgmKw7aTQzVKN7g5B1h4l8epIW.jpeg	2025-09-19 22:56:23.191
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teams (id, name, color, "createdAt", logo_image_url) FROM stdin;
cmfr34vw40001ib04uhl5pn11	SAŠA UDOVIČ WANNABE	#FF6B6B	2025-09-19 16:59:58.709	\N
cmfr515sa000ajm04ge1solq1	Sasa žene	#4ECDC4	2025-09-19 17:53:04.138	\N
cmfr61bom0002ju0493x2ax4k	Smokeye	#45B7D1	2025-09-19 18:21:11.398	\N
cmfr6kpvw000bi104mydir0kt	Kras united	#96CEB4	2025-09-19 18:36:16.268	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/teams/cmfr6kpvw000bi104mydir0kt/1758307464056-9578UgxAYIwkKtGxQscAdMab3eiobE.jpg
cmfr8qfiw001bik04olw4x7ag	Matija, zoja, dominik	#FECA57	2025-09-19 19:36:42.008	https://wovxj29rjhenjtzw.public.blob.vercel-storage.com/teams/cmfr8qfiw001bik04olw4x7ag/1758310918968-qZq5nIu05e3BCCLs3AC2ZzmvS1btqw.jpg
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, "teamId", "createdAt", profile_image_url) FROM stdin;
cmfr34sa90000ib04lr2ohjjz	Tajsss	cmfr34vw40001ib04uhl5pn11	2025-09-19 16:59:54.034	\N
cmfr4kxns0000l4041hif9ufo	Jens	cmfr34vw40001ib04uhl5pn11	2025-09-19 17:40:27.019	\N
cmfr4ppcj0004jo04qpeiohzh	Urosh	cmfr34vw40001ib04uhl5pn11	2025-09-19 17:44:09.527	\N
cmfr4wl5n0005jm04hv4w4epc	Bwsk	cmfr34vw40001ib04uhl5pn11	2025-09-19 17:49:30.687	\N
cmfr4xnlr0003l504mnluk06k	paX	cmfr34vw40001ib04uhl5pn11	2025-09-19 17:50:20.04	\N
cmfr4z6u10004l504udjouaxy	Krix	cmfr515sa000ajm04ge1solq1	2025-09-19 17:51:32.186	\N
cmfr59jlr000qjm04rjfba2vx	Katharina	cmfr515sa000ajm04ge1solq1	2025-09-19 17:59:35.295	\N
cmfr5nh8s0000ju049ugavvcj	Anej	cmfr34vw40001ib04uhl5pn11	2025-09-19 18:10:25.42	\N
cmfr60zip0001ju04bdvm726u	Kicho	cmfr61bom0002ju0493x2ax4k	2025-09-19 18:20:55.541	\N
cmfr64pg10003l504bd6clu0s	Gomby	cmfr61bom0002ju0493x2ax4k	2025-09-19 18:23:49.202	\N
cmfr66rlb0006le04agnslczw	Larson	cmfr61bom0002ju0493x2ax4k	2025-09-19 18:25:25.203	\N
cmfr6j1xq0005ik04fkoemnjh	Kras united	\N	2025-09-19 18:34:58.574	\N
cmfr6kcxd000ai1045l249snz	Optimus prime	cmfr6kpvw000bi104mydir0kt	2025-09-19 18:35:59.473	\N
cmfr6k8bp0009i104v5au9ifv	Davor	cmfr6kpvw000bi104mydir0kt	2025-09-19 18:35:53.417	\N
cmfr6ksyb0000ky04l2z69bak	Mrax	cmfr6kpvw000bi104mydir0kt	2025-09-19 18:36:20.241	\N
cmfr6m6c90007ik04qfs8z3b2	Kras united	cmfr6kpvw000bi104mydir0kt	2025-09-19 18:37:24.25	\N
cmfr6vby90001ky04bzy935u3	Lozo	cmfr61bom0002ju0493x2ax4k	2025-09-19 18:44:31.334	\N
cmfr6wigd000hik04bbsyzlg8	Giulia Lilith	cmfr515sa000ajm04ge1solq1	2025-09-19 18:45:26.417	\N
cmfr7bh9v000pl104hm0a3n8l	Elena	cmfr515sa000ajm04ge1solq1	2025-09-19 18:57:04.82	\N
cmfr8uiwz0000jl04wvrscqzf	Dominik	cmfr8qfiw001bik04olw4x7ag	2025-09-19 19:39:53.027	\N
cmfr8q0jz001aik04xmv2ii8z	Lara	cmfr8qfiw001bik04olw4x7ag	2025-09-19 19:36:22.037	\N
cmfr8vdrs0002ky04ukw2zymo	Zoja	cmfr8qfiw001bik04olw4x7ag	2025-09-19 19:40:33.017	\N
cmfr8yyqg000ll104sxm0hkut	Matija	cmfr8qfiw001bik04olw4x7ag	2025-09-19 19:43:19.589	\N
cmfra2kbm0003l204769m6hui	Topo	cmfr6kpvw000bi104mydir0kt	2025-09-19 20:14:07.715	\N
\.


--
-- Name: users_sync users_sync_pkey; Type: CONSTRAINT; Schema: neon_auth; Owner: neondb_owner
--

ALTER TABLE ONLY neon_auth.users_sync
    ADD CONSTRAINT users_sync_pkey PRIMARY KEY (id);


--
-- Name: commentaries commentaries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.commentaries
    ADD CONSTRAINT commentaries_pkey PRIMARY KEY (id);


--
-- Name: drink_logs drink_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drink_logs
    ADD CONSTRAINT drink_logs_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_sync_deleted_at_idx; Type: INDEX; Schema: neon_auth; Owner: neondb_owner
--

CREATE INDEX users_sync_deleted_at_idx ON neon_auth.users_sync USING btree (deleted_at);


--
-- Name: teams_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX teams_name_key ON public.teams USING btree (name);


--
-- Name: drink_logs drink_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drink_logs
    ADD CONSTRAINT "drink_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict nGU9Qnoj2lyjGUXEmU7GDjJPoDgsiFNkZwwOv6AIb8ewgSPSgEwrAbdEaB1TqwL

