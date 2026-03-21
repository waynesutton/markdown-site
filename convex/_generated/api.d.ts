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
import type * as authAdmin from "../authAdmin.js";
import type * as authComponent from "../authComponent.js";
import type * as cms from "../cms.js";
import type * as contact from "../contact.js";
import type * as contactActions from "../contactActions.js";
import type * as crons from "../crons.js";
import type * as dashboardAuth from "../dashboardAuth.js";
import type * as embeddings from "../embeddings.js";
import type * as embeddingsAdmin from "../embeddingsAdmin.js";
import type * as embeddingsQueries from "../embeddingsQueries.js";
import type * as files from "../files.js";
import type * as fs from "../fs.js";
import type * as http from "../http.js";
import type * as importAction from "../importAction.js";
import type * as importJobs from "../importJobs.js";
import type * as media from "../media.js";
import type * as newsletter from "../newsletter.js";
import type * as newsletterActions from "../newsletterActions.js";
import type * as pages from "../pages.js";
import type * as posts from "../posts.js";
import type * as r2 from "../r2.js";
import type * as rss from "../rss.js";
import type * as search from "../search.js";
import type * as semanticSearch from "../semanticSearch.js";
import type * as semanticSearchJobs from "../semanticSearchJobs.js";
import type * as semanticSearchQueries from "../semanticSearchQueries.js";
import type * as staticHosting from "../staticHosting.js";
import type * as stats from "../stats.js";
import type * as versions from "../versions.js";

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
  authAdmin: typeof authAdmin;
  authComponent: typeof authComponent;
  cms: typeof cms;
  contact: typeof contact;
  contactActions: typeof contactActions;
  crons: typeof crons;
  dashboardAuth: typeof dashboardAuth;
  embeddings: typeof embeddings;
  embeddingsAdmin: typeof embeddingsAdmin;
  embeddingsQueries: typeof embeddingsQueries;
  files: typeof files;
  fs: typeof fs;
  http: typeof http;
  importAction: typeof importAction;
  importJobs: typeof importJobs;
  media: typeof media;
  newsletter: typeof newsletter;
  newsletterActions: typeof newsletterActions;
  pages: typeof pages;
  posts: typeof posts;
  r2: typeof r2;
  rss: typeof rss;
  search: typeof search;
  semanticSearch: typeof semanticSearch;
  semanticSearchJobs: typeof semanticSearchJobs;
  semanticSearchQueries: typeof semanticSearchQueries;
  staticHosting: typeof staticHosting;
  stats: typeof stats;
  versions: typeof versions;
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
  pageViewsByPath: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        { queries: Array<{ k1?: any; k2?: any; namespace?: any }> },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any },
        any
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  totalPageViews: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        { queries: Array<{ k1?: any; k2?: any; namespace?: any }> },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any },
        any
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  uniqueVisitors: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        { queries: Array<{ k1?: any; k2?: any; namespace?: any }> },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any },
        any
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  uniquePaths: {
    btree: {
      aggregateBetween: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any },
        { count: number; sum: number }
      >;
      aggregateBetweenBatch: FunctionReference<
        "query",
        "internal",
        { queries: Array<{ k1?: any; k2?: any; namespace?: any }> },
        Array<{ count: number; sum: number }>
      >;
      atNegativeOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffset: FunctionReference<
        "query",
        "internal",
        { k1?: any; k2?: any; namespace?: any; offset: number },
        { k: any; s: number; v: any }
      >;
      atOffsetBatch: FunctionReference<
        "query",
        "internal",
        {
          queries: Array<{
            k1?: any;
            k2?: any;
            namespace?: any;
            offset: number;
          }>;
        },
        Array<{ k: any; s: number; v: any }>
      >;
      get: FunctionReference<
        "query",
        "internal",
        { key: any; namespace?: any },
        null | { k: any; s: number; v: any }
      >;
      offset: FunctionReference<
        "query",
        "internal",
        { k1?: any; key: any; namespace?: any },
        number
      >;
      offsetUntil: FunctionReference<
        "query",
        "internal",
        { k2?: any; key: any; namespace?: any },
        number
      >;
      paginate: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          k1?: any;
          k2?: any;
          limit: number;
          namespace?: any;
          order: "asc" | "desc";
        },
        {
          cursor: string;
          isDone: boolean;
          page: Array<{ k: any; s: number; v: any }>;
        }
      >;
      paginateNamespaces: FunctionReference<
        "query",
        "internal",
        { cursor?: string; limit: number },
        { cursor: string; isDone: boolean; page: Array<any> }
      >;
      validate: FunctionReference<
        "query",
        "internal",
        { namespace?: any },
        any
      >;
    };
    inspect: {
      display: FunctionReference<"query", "internal", { namespace?: any }, any>;
      dump: FunctionReference<"query", "internal", { namespace?: any }, string>;
      inspectNode: FunctionReference<
        "query",
        "internal",
        { namespace?: any; node?: string },
        null
      >;
      listTreeNodes: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          aggregate?: { count: number; sum: number };
          items: Array<{ k: any; s: number; v: any }>;
          subtrees: Array<string>;
        }>
      >;
      listTrees: FunctionReference<
        "query",
        "internal",
        { take?: number },
        Array<{
          _creationTime: number;
          _id: string;
          maxNodeSize: number;
          namespace?: any;
          root: string;
        }>
      >;
    };
    public: {
      clear: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      delete_: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        null
      >;
      deleteIfExists: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any },
        any
      >;
      init: FunctionReference<
        "mutation",
        "internal",
        { maxNodeSize?: number; namespace?: any; rootLazy?: boolean },
        null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        { key: any; namespace?: any; summand?: number; value: any },
        null
      >;
      makeRootLazy: FunctionReference<
        "mutation",
        "internal",
        { namespace?: any },
        null
      >;
      replace: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        null
      >;
      replaceOrInsert: FunctionReference<
        "mutation",
        "internal",
        {
          currentKey: any;
          namespace?: any;
          newKey: any;
          newNamespace?: any;
          summand?: number;
          value: any;
        },
        any
      >;
    };
  };
  persistentTextStreaming: {
    lib: {
      addChunk: FunctionReference<
        "mutation",
        "internal",
        { final: boolean; streamId: string; text: string },
        any
      >;
      createStream: FunctionReference<"mutation", "internal", {}, any>;
      getStreamStatus: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        "pending" | "streaming" | "done" | "error" | "timeout"
      >;
      getStreamText: FunctionReference<
        "query",
        "internal",
        { streamId: string },
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          text: string;
        }
      >;
      setStreamStatus: FunctionReference<
        "mutation",
        "internal",
        {
          status: "pending" | "streaming" | "done" | "error" | "timeout";
          streamId: string;
        },
        any
      >;
    };
  };
  auth: {
    bridge: {
      gcOldAssets: FunctionReference<
        "mutation",
        "internal",
        { currentDeploymentId: string },
        any
      >;
      getByPath: FunctionReference<"query", "internal", { path: string }, any>;
      getCurrentDeployment: FunctionReference<"query", "internal", {}, any>;
      listAssets: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        any
      >;
      recordAsset: FunctionReference<
        "mutation",
        "internal",
        {
          blobId?: string;
          contentType: string;
          deploymentId: string;
          path: string;
          storageId?: string;
        },
        any
      >;
      setCurrentDeployment: FunctionReference<
        "mutation",
        "internal",
        { deploymentId: string },
        null
      >;
    };
    public: {
      accountDelete: FunctionReference<
        "mutation",
        "internal",
        { accountId: string },
        any
      >;
      accountGet: FunctionReference<
        "query",
        "internal",
        { provider: string; providerAccountId: string },
        any
      >;
      accountGetById: FunctionReference<
        "query",
        "internal",
        { accountId: string },
        any
      >;
      accountInsert: FunctionReference<
        "mutation",
        "internal",
        {
          provider: string;
          providerAccountId: string;
          secret?: string;
          userId: string;
        },
        any
      >;
      accountListByUser: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      accountPatch: FunctionReference<
        "mutation",
        "internal",
        { accountId: string; data: any },
        any
      >;
      deviceAuthorize: FunctionReference<
        "mutation",
        "internal",
        { deviceId: string; sessionId: string; userId: string },
        any
      >;
      deviceDelete: FunctionReference<
        "mutation",
        "internal",
        { deviceId: string },
        any
      >;
      deviceGetByCodeHash: FunctionReference<
        "query",
        "internal",
        { deviceCodeHash: string },
        any
      >;
      deviceGetByUserCode: FunctionReference<
        "query",
        "internal",
        { userCode: string },
        any
      >;
      deviceInsert: FunctionReference<
        "mutation",
        "internal",
        {
          deviceCodeHash: string;
          expiresAt: number;
          interval: number;
          status: "pending" | "authorized" | "denied";
          userCode: string;
        },
        any
      >;
      deviceUpdateLastPolled: FunctionReference<
        "mutation",
        "internal",
        { deviceId: string; lastPolledAt: number },
        any
      >;
      groupCreate: FunctionReference<
        "mutation",
        "internal",
        {
          extend?: any;
          name: string;
          parentGroupId?: string;
          slug?: string;
          tags?: Array<{ key: string; value: string }>;
          type?: string;
        },
        any
      >;
      groupDelete: FunctionReference<
        "mutation",
        "internal",
        { groupId: string },
        any
      >;
      groupGet: FunctionReference<
        "query",
        "internal",
        { groupId: string },
        any
      >;
      groupList: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string | null;
          limit?: number;
          order?: "asc" | "desc";
          orderBy?: "_creationTime" | "name" | "slug" | "type";
          where?: {
            isRoot?: boolean;
            name?: string;
            parentGroupId?: string;
            slug?: string;
            tagsAll?: Array<{ key: string; value: string }>;
            tagsAny?: Array<{ key: string; value: string }>;
            type?: string;
          };
        },
        any
      >;
      groupUpdate: FunctionReference<
        "mutation",
        "internal",
        { data: any; groupId: string },
        any
      >;
      inviteAccept: FunctionReference<
        "mutation",
        "internal",
        { acceptedByUserId?: string; inviteId: string },
        any
      >;
      inviteCreate: FunctionReference<
        "mutation",
        "internal",
        {
          email?: string;
          expiresTime?: number;
          extend?: any;
          groupId?: string;
          invitedByUserId?: string;
          role?: string;
          status: "pending" | "accepted" | "revoked" | "expired";
          tokenHash: string;
        },
        any
      >;
      inviteGet: FunctionReference<
        "query",
        "internal",
        { inviteId: string },
        any
      >;
      inviteList: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string | null;
          limit?: number;
          order?: "asc" | "desc";
          orderBy?:
            | "_creationTime"
            | "status"
            | "email"
            | "expiresTime"
            | "acceptedTime";
          where?: {
            acceptedByUserId?: string;
            email?: string;
            groupId?: string;
            invitedByUserId?: string;
            role?: string;
            status?: "pending" | "accepted" | "revoked" | "expired";
            tokenHash?: string;
          };
        },
        any
      >;
      inviteRevoke: FunctionReference<
        "mutation",
        "internal",
        { inviteId: string },
        any
      >;
      keyDelete: FunctionReference<
        "mutation",
        "internal",
        { keyId: string },
        any
      >;
      keyGetByHashedKey: FunctionReference<
        "query",
        "internal",
        { hashedKey: string },
        any
      >;
      keyGetById: FunctionReference<
        "query",
        "internal",
        { keyId: string },
        any
      >;
      keyInsert: FunctionReference<
        "mutation",
        "internal",
        {
          expiresAt?: number;
          hashedKey: string;
          name: string;
          prefix: string;
          rateLimit?: { maxRequests: number; windowMs: number };
          scopes: Array<{ actions: Array<string>; resource: string }>;
          userId: string;
        },
        any
      >;
      keyList: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string | null;
          limit?: number;
          order?: "asc" | "desc";
          orderBy?:
            | "_creationTime"
            | "name"
            | "lastUsedAt"
            | "expiresAt"
            | "revoked";
          where?: {
            name?: string;
            prefix?: string;
            revoked?: boolean;
            userId?: string;
          };
        },
        any
      >;
      keyListByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      keyPatch: FunctionReference<
        "mutation",
        "internal",
        {
          data: {
            lastUsedAt?: number;
            name?: string;
            rateLimit?: { maxRequests: number; windowMs: number };
            rateLimitState?: { attemptsLeft: number; lastAttemptTime: number };
            revoked?: boolean;
            scopes?: Array<{ actions: Array<string>; resource: string }>;
          };
          keyId: string;
        },
        any
      >;
      memberAdd: FunctionReference<
        "mutation",
        "internal",
        {
          extend?: any;
          groupId: string;
          role?: string;
          status?: string;
          userId: string;
        },
        any
      >;
      memberGet: FunctionReference<
        "query",
        "internal",
        { memberId: string },
        any
      >;
      memberGetByGroupAndUser: FunctionReference<
        "query",
        "internal",
        { groupId: string; userId: string },
        any
      >;
      memberList: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string | null;
          limit?: number;
          order?: "asc" | "desc";
          orderBy?: "_creationTime" | "role" | "status";
          where?: {
            groupId?: string;
            role?: string;
            status?: string;
            userId?: string;
          };
        },
        any
      >;
      memberListByUser: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      memberRemove: FunctionReference<
        "mutation",
        "internal",
        { memberId: string },
        any
      >;
      memberUpdate: FunctionReference<
        "mutation",
        "internal",
        { data: any; memberId: string },
        any
      >;
      passkeyDelete: FunctionReference<
        "mutation",
        "internal",
        { passkeyId: string },
        any
      >;
      passkeyGetByCredentialId: FunctionReference<
        "query",
        "internal",
        { credentialId: string },
        any
      >;
      passkeyInsert: FunctionReference<
        "mutation",
        "internal",
        {
          algorithm: number;
          backedUp: boolean;
          counter: number;
          createdAt: number;
          credentialId: string;
          deviceType: string;
          name?: string;
          publicKey: ArrayBuffer;
          transports?: Array<string>;
          userId: string;
        },
        any
      >;
      passkeyListByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      passkeyUpdateCounter: FunctionReference<
        "mutation",
        "internal",
        { counter: number; lastUsedAt: number; passkeyId: string },
        any
      >;
      passkeyUpdateMeta: FunctionReference<
        "mutation",
        "internal",
        { data: any; passkeyId: string },
        any
      >;
      rateLimitCreate: FunctionReference<
        "mutation",
        "internal",
        { attemptsLeft: number; identifier: string; lastAttemptTime: number },
        any
      >;
      rateLimitDelete: FunctionReference<
        "mutation",
        "internal",
        { rateLimitId: string },
        any
      >;
      rateLimitGet: FunctionReference<
        "query",
        "internal",
        { identifier: string },
        any
      >;
      rateLimitPatch: FunctionReference<
        "mutation",
        "internal",
        { data: any; rateLimitId: string },
        any
      >;
      refreshTokenCreate: FunctionReference<
        "mutation",
        "internal",
        {
          expirationTime: number;
          parentRefreshTokenId?: string;
          sessionId: string;
        },
        any
      >;
      refreshTokenDeleteAll: FunctionReference<
        "mutation",
        "internal",
        { sessionId: string },
        any
      >;
      refreshTokenGetActive: FunctionReference<
        "query",
        "internal",
        { sessionId: string },
        any
      >;
      refreshTokenGetById: FunctionReference<
        "query",
        "internal",
        { refreshTokenId: string },
        any
      >;
      refreshTokenGetChildren: FunctionReference<
        "query",
        "internal",
        { parentRefreshTokenId: string; sessionId: string },
        any
      >;
      refreshTokenListBySession: FunctionReference<
        "query",
        "internal",
        { sessionId: string },
        any
      >;
      refreshTokenPatch: FunctionReference<
        "mutation",
        "internal",
        { data: any; refreshTokenId: string },
        any
      >;
      sessionCreate: FunctionReference<
        "mutation",
        "internal",
        { expirationTime: number; userId: string },
        any
      >;
      sessionDelete: FunctionReference<
        "mutation",
        "internal",
        { sessionId: string },
        any
      >;
      sessionGetById: FunctionReference<
        "query",
        "internal",
        { sessionId: string },
        any
      >;
      sessionList: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string | null;
          limit?: number;
          order?: "asc" | "desc";
          where?: { userId?: string };
        },
        any
      >;
      sessionListByUser: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      totpDelete: FunctionReference<
        "mutation",
        "internal",
        { totpId: string },
        any
      >;
      totpGetById: FunctionReference<
        "query",
        "internal",
        { totpId: string },
        any
      >;
      totpGetVerifiedByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      totpInsert: FunctionReference<
        "mutation",
        "internal",
        {
          createdAt: number;
          digits: number;
          name?: string;
          period: number;
          secret: ArrayBuffer;
          userId: string;
          verified: boolean;
        },
        any
      >;
      totpListByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      totpMarkVerified: FunctionReference<
        "mutation",
        "internal",
        { lastUsedAt: number; totpId: string },
        any
      >;
      totpUpdateLastUsed: FunctionReference<
        "mutation",
        "internal",
        { lastUsedAt: number; totpId: string },
        any
      >;
      userFindByVerifiedEmail: FunctionReference<
        "query",
        "internal",
        { email: string },
        any
      >;
      userFindByVerifiedPhone: FunctionReference<
        "query",
        "internal",
        { phone: string },
        any
      >;
      userGetById: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      userInsert: FunctionReference<"mutation", "internal", { data: any }, any>;
      userList: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string | null;
          limit?: number;
          order?: "asc" | "desc";
          orderBy?: "_creationTime" | "name" | "email" | "phone";
          where?: {
            email?: string;
            isAnonymous?: boolean;
            name?: string;
            phone?: string;
          };
        },
        any
      >;
      userPatch: FunctionReference<
        "mutation",
        "internal",
        { data: any; userId: string },
        any
      >;
      userUpsert: FunctionReference<
        "mutation",
        "internal",
        { data: any; userId?: string },
        any
      >;
      verificationCodeCreate: FunctionReference<
        "mutation",
        "internal",
        {
          accountId: string;
          code: string;
          emailVerified?: string;
          expirationTime: number;
          phoneVerified?: string;
          provider: string;
          verifier?: string;
        },
        any
      >;
      verificationCodeDelete: FunctionReference<
        "mutation",
        "internal",
        { verificationCodeId: string },
        any
      >;
      verificationCodeGetByAccountId: FunctionReference<
        "query",
        "internal",
        { accountId: string },
        any
      >;
      verificationCodeGetByCode: FunctionReference<
        "query",
        "internal",
        { code: string },
        any
      >;
      verifierCreate: FunctionReference<
        "mutation",
        "internal",
        { sessionId?: string },
        any
      >;
      verifierDelete: FunctionReference<
        "mutation",
        "internal",
        { verifierId: string },
        any
      >;
      verifierGetById: FunctionReference<
        "query",
        "internal",
        { verifierId: string },
        any
      >;
      verifierGetBySignature: FunctionReference<
        "query",
        "internal",
        { signature: string },
        any
      >;
      verifierPatch: FunctionReference<
        "mutation",
        "internal",
        { data: any; verifierId: string },
        any
      >;
    };
  };
  selfHosting: {
    lib: {
      gcOldAssets: FunctionReference<
        "mutation",
        "internal",
        { currentDeploymentId: string },
        { blobIds: Array<string>; storageIds: Array<string> }
      >;
      generateUploadUrl: FunctionReference<"mutation", "internal", {}, string>;
      getByPath: FunctionReference<
        "query",
        "internal",
        { path: string },
        {
          _creationTime: number;
          _id: string;
          blobId?: string;
          contentType: string;
          deploymentId: string;
          path: string;
          storageId?: string;
        } | null
      >;
      getCurrentDeployment: FunctionReference<
        "query",
        "internal",
        {},
        {
          _creationTime: number;
          _id: string;
          currentDeploymentId: string;
          deployedAt: number;
        } | null
      >;
      listAssets: FunctionReference<
        "query",
        "internal",
        { limit?: number },
        Array<{
          _creationTime: number;
          _id: string;
          blobId?: string;
          contentType: string;
          deploymentId: string;
          path: string;
          storageId?: string;
        }>
      >;
      recordAsset: FunctionReference<
        "mutation",
        "internal",
        {
          blobId?: string;
          contentType: string;
          deploymentId: string;
          path: string;
          storageId?: string;
        },
        { oldBlobId: string | null; oldStorageId: string | null }
      >;
      setCurrentDeployment: FunctionReference<
        "mutation",
        "internal",
        { deploymentId: string },
        null
      >;
    };
  };
  r2: {
    lib: {
      deleteMetadata: FunctionReference<
        "mutation",
        "internal",
        { bucket: string; key: string },
        null
      >;
      deleteObject: FunctionReference<
        "mutation",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      deleteR2Object: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        null
      >;
      getMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          secretAccessKey: string;
        },
        {
          bucket: string;
          bucketLink: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
          url: string;
        } | null
      >;
      listMetadata: FunctionReference<
        "query",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          cursor?: string;
          endpoint: string;
          limit?: number;
          secretAccessKey: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            bucket: string;
            bucketLink: string;
            contentType?: string;
            key: string;
            lastModified: string;
            link: string;
            sha256?: string;
            size?: number;
            url: string;
          }>;
          pageStatus?: null | "SplitRecommended" | "SplitRequired";
          splitCursor?: null | string;
        }
      >;
      store: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          secretAccessKey: string;
          url: string;
        },
        any
      >;
      syncMetadata: FunctionReference<
        "action",
        "internal",
        {
          accessKeyId: string;
          bucket: string;
          endpoint: string;
          key: string;
          onComplete?: string;
          secretAccessKey: string;
        },
        null
      >;
      upsertMetadata: FunctionReference<
        "mutation",
        "internal",
        {
          bucket: string;
          contentType?: string;
          key: string;
          lastModified: string;
          link: string;
          sha256?: string;
          size?: number;
        },
        { isNew: boolean }
      >;
    };
  };
  fs: {
    lib: {
      commitFiles: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          files: Array<{
            attributes?: { expiresAt?: number };
            basis?: null | string;
            blobId: string;
            path: string;
          }>;
        },
        null
      >;
      copyByPath: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          destPath: string;
          sourcePath: string;
        },
        null
      >;
      deleteByPath: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          path: string;
        },
        null
      >;
      getDownloadUrl: FunctionReference<
        "action",
        "internal",
        {
          blobId: string;
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          extraParams?: Record<string, string>;
        },
        string
      >;
      list: FunctionReference<
        "query",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          prefix?: string;
        },
        {
          continueCursor: string;
          isDone: boolean;
          page: Array<{
            attributes?: { expiresAt?: number };
            blobId: string;
            contentType: string;
            path: string;
            size: number;
          }>;
        }
      >;
      moveByPath: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          destPath: string;
          sourcePath: string;
        },
        null
      >;
      registerPendingUpload: FunctionReference<
        "mutation",
        "internal",
        {
          blobId: string;
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          contentType: string;
          size: number;
        },
        null
      >;
      stat: FunctionReference<
        "query",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          path: string;
        },
        null | {
          attributes?: { expiresAt?: number };
          blobId: string;
          contentType: string;
          path: string;
          size: number;
        }
      >;
      transact: FunctionReference<
        "mutation",
        "internal",
        {
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          ops: Array<
            | {
                dest: { basis?: null | string; path: string };
                op: "move";
                source: {
                  attributes?: { expiresAt?: number };
                  blobId: string;
                  contentType: string;
                  path: string;
                  size: number;
                };
              }
            | {
                dest: { basis?: null | string; path: string };
                op: "copy";
                source: {
                  attributes?: { expiresAt?: number };
                  blobId: string;
                  contentType: string;
                  path: string;
                  size: number;
                };
              }
            | {
                op: "delete";
                source: {
                  attributes?: { expiresAt?: number };
                  blobId: string;
                  contentType: string;
                  path: string;
                  size: number;
                };
              }
            | {
                attributes: { expiresAt?: null | number };
                op: "setAttributes";
                source: {
                  attributes?: { expiresAt?: number };
                  blobId: string;
                  contentType: string;
                  path: string;
                  size: number;
                };
              }
          >;
        },
        null
      >;
    };
    ops: {
      basics: {
        copyByPath: FunctionReference<
          "mutation",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            destPath: string;
            sourcePath: string;
          },
          null
        >;
        deleteByPath: FunctionReference<
          "mutation",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            path: string;
          },
          null
        >;
        list: FunctionReference<
          "query",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            prefix?: string;
          },
          {
            continueCursor: string;
            isDone: boolean;
            page: Array<{
              attributes?: { expiresAt?: number };
              blobId: string;
              contentType: string;
              path: string;
              size: number;
            }>;
          }
        >;
        moveByPath: FunctionReference<
          "mutation",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            destPath: string;
            sourcePath: string;
          },
          null
        >;
        stat: FunctionReference<
          "query",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            path: string;
          },
          null | {
            attributes?: { expiresAt?: number };
            blobId: string;
            contentType: string;
            path: string;
            size: number;
          }
        >;
      };
      transact: {
        commitFiles: FunctionReference<
          "mutation",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            files: Array<{
              attributes?: { expiresAt?: number };
              basis?: null | string;
              blobId: string;
              path: string;
            }>;
          },
          null
        >;
        transact: FunctionReference<
          "mutation",
          "internal",
          {
            config: {
              blobGracePeriod?: number;
              downloadUrlTtl?: number;
              storage:
                | {
                    apiKey: string;
                    cdnHostname: string;
                    region?: string;
                    storageZoneName: string;
                    tokenKey?: string;
                    type: "bunny";
                  }
                | { type: "test" };
            };
            ops: Array<
              | {
                  dest: { basis?: null | string; path: string };
                  op: "move";
                  source: {
                    attributes?: { expiresAt?: number };
                    blobId: string;
                    contentType: string;
                    path: string;
                    size: number;
                  };
                }
              | {
                  dest: { basis?: null | string; path: string };
                  op: "copy";
                  source: {
                    attributes?: { expiresAt?: number };
                    blobId: string;
                    contentType: string;
                    path: string;
                    size: number;
                  };
                }
              | {
                  op: "delete";
                  source: {
                    attributes?: { expiresAt?: number };
                    blobId: string;
                    contentType: string;
                    path: string;
                    size: number;
                  };
                }
              | {
                  attributes: { expiresAt?: null | number };
                  op: "setAttributes";
                  source: {
                    attributes?: { expiresAt?: number };
                    blobId: string;
                    contentType: string;
                    path: string;
                    size: number;
                  };
                }
            >;
          },
          null
        >;
      };
    };
    transfer: {
      getDownloadUrl: FunctionReference<
        "action",
        "internal",
        {
          blobId: string;
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          extraParams?: Record<string, string>;
        },
        string
      >;
      registerPendingUpload: FunctionReference<
        "mutation",
        "internal",
        {
          blobId: string;
          config: {
            blobGracePeriod?: number;
            downloadUrlTtl?: number;
            storage:
              | {
                  apiKey: string;
                  cdnHostname: string;
                  region?: string;
                  storageZoneName: string;
                  tokenKey?: string;
                  type: "bunny";
                }
              | { type: "test" };
          };
          contentType: string;
          size: number;
        },
        null
      >;
    };
  };
};
