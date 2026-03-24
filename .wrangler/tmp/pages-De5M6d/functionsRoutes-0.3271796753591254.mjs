import { onRequestPost as __api_purchase_create_checkout_session_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\purchase\\create-checkout-session.ts"
import { onRequestPost as __api_purchase_webhook_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\purchase\\webhook.ts"
import { onRequestGet as __api_user_balance_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\user\\balance.ts"
import { onRequestGet as __api_admin_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\admin.ts"
import { onRequestOptions as __api_admin_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\admin.ts"
import { onRequestPost as __api_admin_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\admin.ts"
import { onRequestGet as __api_agent_signups_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\agent-signups.ts"
import { onRequestOptions as __api_agent_signups_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\agent-signups.ts"
import { onRequestPatch as __api_agent_signups_ts_onRequestPatch } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\agent-signups.ts"
import { onRequestPost as __api_agent_signups_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\agent-signups.ts"
import { onRequestGet as __api_health_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\health.ts"
import { onRequestOptions as __api_health_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\health.ts"
import { onRequestGet as __api_models_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\models.ts"
import { onRequestPost as __api_models_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\models.ts"
import { onRequestGet as __api_newsletter_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\newsletter.ts"
import { onRequestOptions as __api_newsletter_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\newsletter.ts"
import { onRequestPost as __api_newsletter_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\newsletter.ts"
import { onRequestPost as __api_stt_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\stt.ts"
import { onRequestGet as __api_tiers_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\tiers.ts"
import { onRequestOptions as __api_tiers_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\tiers.ts"
import { onRequestPost as __api_tiers_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\tiers.ts"
import { onRequestOptions as __api_tts_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\tts.ts"
import { onRequestPost as __api_tts_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\tts.ts"
import { onRequestGet as __api_wallet_ts_onRequestGet } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\wallet.ts"
import { onRequestOptions as __api_wallet_ts_onRequestOptions } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\wallet.ts"
import { onRequestPost as __api_wallet_ts_onRequestPost } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\wallet.ts"
import { onRequest as __api_ai_ts_onRequest } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\api\\ai.ts"
import { onRequest as ___middleware_ts_onRequest } from "C:\\Users\\Weed j\\Downloads\\ai-sanctuary-website\\functions\\_middleware.ts"

export const routes = [
    {
      routePath: "/api/purchase/create-checkout-session",
      mountPath: "/api/purchase",
      method: "POST",
      middlewares: [],
      modules: [__api_purchase_create_checkout_session_ts_onRequestPost],
    },
  {
      routePath: "/api/purchase/webhook",
      mountPath: "/api/purchase",
      method: "POST",
      middlewares: [],
      modules: [__api_purchase_webhook_ts_onRequestPost],
    },
  {
      routePath: "/api/user/balance",
      mountPath: "/api/user",
      method: "GET",
      middlewares: [],
      modules: [__api_user_balance_ts_onRequestGet],
    },
  {
      routePath: "/api/admin",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_ts_onRequestGet],
    },
  {
      routePath: "/api/admin",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_admin_ts_onRequestOptions],
    },
  {
      routePath: "/api/admin",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_ts_onRequestPost],
    },
  {
      routePath: "/api/agent-signups",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_agent_signups_ts_onRequestGet],
    },
  {
      routePath: "/api/agent-signups",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_agent_signups_ts_onRequestOptions],
    },
  {
      routePath: "/api/agent-signups",
      mountPath: "/api",
      method: "PATCH",
      middlewares: [],
      modules: [__api_agent_signups_ts_onRequestPatch],
    },
  {
      routePath: "/api/agent-signups",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_agent_signups_ts_onRequestPost],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_health_ts_onRequestGet],
    },
  {
      routePath: "/api/health",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_health_ts_onRequestOptions],
    },
  {
      routePath: "/api/models",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_models_ts_onRequestGet],
    },
  {
      routePath: "/api/models",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_models_ts_onRequestPost],
    },
  {
      routePath: "/api/newsletter",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_newsletter_ts_onRequestGet],
    },
  {
      routePath: "/api/newsletter",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_newsletter_ts_onRequestOptions],
    },
  {
      routePath: "/api/newsletter",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_newsletter_ts_onRequestPost],
    },
  {
      routePath: "/api/stt",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_stt_ts_onRequestPost],
    },
  {
      routePath: "/api/tiers",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_tiers_ts_onRequestGet],
    },
  {
      routePath: "/api/tiers",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tiers_ts_onRequestOptions],
    },
  {
      routePath: "/api/tiers",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tiers_ts_onRequestPost],
    },
  {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_tts_ts_onRequestOptions],
    },
  {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_tts_ts_onRequestPost],
    },
  {
      routePath: "/api/wallet",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_wallet_ts_onRequestGet],
    },
  {
      routePath: "/api/wallet",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_wallet_ts_onRequestOptions],
    },
  {
      routePath: "/api/wallet",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_wallet_ts_onRequestPost],
    },
  {
      routePath: "/api/ai",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_ai_ts_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]