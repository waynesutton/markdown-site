/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiChatActions from "../aiChatActions.js";
import type * as aiChats from "../aiChats.js";
import type * as aiImageGeneration from "../aiImageGeneration.js";
import type * as aiImageJobs from "../aiImageJobs.js";
import type * as askAI from "../askAI.js";
import type * as auth from "../auth.js";
import type * as auth_core from "../auth/core.js";
import type * as authAdmin from "../authAdmin.js";
import type * as authComponent from "../authComponent.js";
import type * as cms from "../cms.js";
import type * as contact from "../contact.js";
import type * as contactActions from "../contactActions.js";
import type * as crons from "../crons.js";
import type * as dashboardAuth from "../dashboardAuth.js";
import type * as demo from "../demo.js";
import type * as embeddings from "../embeddings.js";
import type * as embeddingsAdmin from "../embeddingsAdmin.js";
import type * as embeddingsQueries from "../embeddingsQueries.js";
import type * as files from "../files.js";
import type * as fs from "../fs.js";
import type * as http from "../http.js";
import type * as importAction from "../importAction.js";
import type * as importJobs from "../importJobs.js";
import type * as kbUpload from "../kbUpload.js";
import type * as knowledgeBases from "../knowledgeBases.js";
import type * as media from "../media.js";
import type * as newsletter from "../newsletter.js";
import type * as newsletterActions from "../newsletterActions.js";
import type * as pages from "../pages.js";
import type * as posts from "../posts.js";
import type * as r2 from "../r2.js";
import type * as rateLimits from "../rateLimits.js";
import type * as rss from "../rss.js";
import type * as search from "../search.js";
import type * as semanticSearch from "../semanticSearch.js";
import type * as semanticSearchJobs from "../semanticSearchJobs.js";
import type * as semanticSearchQueries from "../semanticSearchQueries.js";
import type * as sourceActions from "../sourceActions.js";
import type * as sources from "../sources.js";
import type * as staticHosting from "../staticHosting.js";
import type * as stats from "../stats.js";
import type * as versions from "../versions.js";
import type * as virtualFs from "../virtualFs.js";
import type * as wiki from "../wiki.js";
import type * as wikiCompiler from "../wikiCompiler.js";
import type * as wikiJobs from "../wikiJobs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiChatActions: typeof aiChatActions;
  aiChats: typeof aiChats;
  aiImageGeneration: typeof aiImageGeneration;
  aiImageJobs: typeof aiImageJobs;
  askAI: typeof askAI;
  auth: typeof auth;
  "auth/core": typeof auth_core;
  authAdmin: typeof authAdmin;
  authComponent: typeof authComponent;
  cms: typeof cms;
  contact: typeof contact;
  contactActions: typeof contactActions;
  crons: typeof crons;
  dashboardAuth: typeof dashboardAuth;
  demo: typeof demo;
  embeddings: typeof embeddings;
  embeddingsAdmin: typeof embeddingsAdmin;
  embeddingsQueries: typeof embeddingsQueries;
  files: typeof files;
  fs: typeof fs;
  http: typeof http;
  importAction: typeof importAction;
  importJobs: typeof importJobs;
  kbUpload: typeof kbUpload;
  knowledgeBases: typeof knowledgeBases;
  media: typeof media;
  newsletter: typeof newsletter;
  newsletterActions: typeof newsletterActions;
  pages: typeof pages;
  posts: typeof posts;
  r2: typeof r2;
  rateLimits: typeof rateLimits;
  rss: typeof rss;
  search: typeof search;
  semanticSearch: typeof semanticSearch;
  semanticSearchJobs: typeof semanticSearchJobs;
  semanticSearchQueries: typeof semanticSearchQueries;
  sourceActions: typeof sourceActions;
  sources: typeof sources;
  staticHosting: typeof staticHosting;
  stats: typeof stats;
  versions: typeof versions;
  virtualFs: typeof virtualFs;
  wiki: typeof wiki;
  wikiCompiler: typeof wikiCompiler;
  wikiJobs: typeof wikiJobs;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  pageViewsByPath: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"pageViewsByPath">;
  totalPageViews: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"totalPageViews">;
  uniqueVisitors: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"uniqueVisitors">;
  uniquePaths: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"uniquePaths">;
  persistentTextStreaming: import("@convex-dev/persistent-text-streaming/_generated/component.js").ComponentApi<"persistentTextStreaming">;
  auth: import("@robelest/convex-auth/_generated/component.js").ComponentApi<"auth">;
  selfHosting: import("@convex-dev/self-hosting/_generated/component.js").ComponentApi<"selfHosting">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
  fs: import("convex-fs/_generated/component.js").ComponentApi<"fs">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
