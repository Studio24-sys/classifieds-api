--
-- PostgreSQL database dump
--

\restrict Nfcl0JIjYoSfHvKRDKZQ6bdeGgxOkRyRyGZV01dc32r84ltZZWw0nrZhJI05hh8

-- Dumped from database version 17.5 (1b53132)
-- Dumped by pg_dump version 17.6

-- Started on 2025-09-11 18:01:29

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
-- TOC entry 5 (class 2615 OID 40962)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 3357 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 40983)
-- Name: Post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Post" (
    id text NOT NULL,
    title text NOT NULL,
    content text,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 40974)
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text
);


--
-- TOC entry 217 (class 1259 OID 40963)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 3351 (class 0 OID 40983)
-- Dependencies: 219
-- Data for Name: Post; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Post" (id, title, content, "authorId", "createdAt") FROM stdin;
cmfeqkxz200019m6b8bexmkf1	Second Post	More content	cmfenivjt000011hlv5pulb97	2025-09-11 01:35:18.765
\.


--
-- TOC entry 3350 (class 0 OID 40974)
-- Dependencies: 218
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, password, "createdAt", name) FROM stdin;
cmfenivjt000011hlv5pulb97	test@example.com	$2a$10$Ve9VDyd5ukDD0yROWO52J.1nLKV6MWbR5L1FMPBTvGx3QLOQ.wa3S	2025-09-11 00:09:43.481	\N
\.


--
-- TOC entry 3349 (class 0 OID 40963)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f77ac8e2-ea14-46a2-9304-dace5897cb74	c2002e3526d2462001bcfb0d82b3d4c0db542879cb2354e49a30db8326d292ae	2025-09-10 22:21:41.393862+00	20250910222141_init_neon	\N	\N	2025-09-10 22:21:41.223938+00	1
9848dd7d-c7fc-47f1-b974-d408bcdde433	d259e309393251cfb1c470600b532f1285c635083f576a34ec094e8be81da6b8	2025-09-11 00:09:09.01628+00	20250911000908_add_user_name	\N	\N	2025-09-11 00:09:08.834388+00	1
\.


--
-- TOC entry 3202 (class 2606 OID 49253)
-- Name: Post Post_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_pkey" PRIMARY KEY (id);


--
-- TOC entry 3200 (class 2606 OID 40981)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3197 (class 2606 OID 40971)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3198 (class 1259 OID 40992)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 3203 (class 2606 OID 40993)
-- Name: Post Post_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Post"
    ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-09-11 18:01:33

--
-- PostgreSQL database dump complete
--

\unrestrict Nfcl0JIjYoSfHvKRDKZQ6bdeGgxOkRyRyGZV01dc32r84ltZZWw0nrZhJI05hh8

