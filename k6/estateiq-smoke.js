/**
 * EstateIQ smoke checks — works in:
 *   • Grafana Cloud Synthetic Monitoring (k6 scripted check) — one iteration; thresholds ignored by SM
 *   • Grafana Cloud k6 / local CLI — add thresholds + load via env (see bottom)
 *
 * Synthetic Monitoring: set check "Instance" to your origin (e.g. https://app.example.com) OR set org env BASE_URL.
 * In the script editor, replace DEFAULT_BASE below if you do not use env vars.
 *
 * SM limits: https://grafana.com/docs/grafana-cloud/testing/synthetic-monitoring/create-checks/checks/k6/
 *   — thresholds not supported in SM; vus/duration/stages ignored (single iteration).
 *
 * Local / Grafana Cloud k6 load test:
 *   k6 run -e BASE_URL=https://your-app.example.com -e VUS=2 -e DURATION=2m estateiq-smoke.js
 */

import http from 'k6/http'
import { check, group, sleep } from 'k6'

function stripTrailingSlash(s) {
  if (!s || typeof s !== 'string') return ''
  return s.replace(/\/$/, '')
}

// Prefer env; for SM you can set DEFAULT_BASE to your production URL if env is not available
const DEFAULT_BASE = ''
const baseUrl = stripTrailingSlash(
  __ENV.BASE_URL || __ENV.TARGET_URL || DEFAULT_BASE
)

if (!baseUrl) {
  throw new Error(
    'Set BASE_URL (or TARGET_URL) in k6 env, or set DEFAULT_BASE in estateiq-smoke.js to your site origin (no trailing slash).'
  )
}

function allowDegradedHealth() {
  return __ENV.ALLOW_DEGRADED_HEALTH === '1'
}

function headerLocation(res) {
  const h = res.headers || {}
  return h.Location || h.location || h['Location'] || ''
}

function isRedirectStatus(code) {
  return code === 301 || code === 302 || code === 303 || code === 307 || code === 308
}

const loadTestEnv = __ENV.VUS || __ENV.DURATION

/** SM: only tags (thresholds / vus / duration are unsupported or ignored). CLI/k6 Cloud: set VUS or DURATION for load + thresholds. */
export const options = loadTestEnv
  ? {
      tags: { suite: 'estateiq-smoke' },
      vus: Number(__ENV.VUS) || 1,
      duration: __ENV.DURATION || '1m',
      thresholds: {
        http_req_duration: ['p(95)<3000'],
        http_req_failed: ['rate<0.05'],
      },
    }
  : {
      tags: { suite: 'estateiq-smoke' },
    }

const publicPaths = [
  { path: '/', name: 'home' },
  { path: '/sign-in', name: 'sign-in' },
  { path: '/sign-up', name: 'sign-up' },
  { path: '/pricing', name: 'pricing' },
  { path: '/terms', name: 'terms' },
  { path: '/privacy', name: 'privacy' },
  { path: '/forgot-password', name: 'forgot-password' },
]

function assertPage(res, name) {
  return check(res, {
    [name + ' status 200']: function (r) {
      return r.status === 200
    },
    [name + ' has body']: function (r) {
      const b = r.body || ''
      return b.length > 100
    },
  })
}

function parseJson(res) {
  try {
    return res.json()
  } catch (e) {
    return null
  }
}

export default function () {
  group('public pages', function () {
    for (let i = 0; i < publicPaths.length; i++) {
      const item = publicPaths[i]
      const url = baseUrl + item.path
      const res = http.get(url, {
        tags: { page: item.name },
        timeout: '30s',
      })
      assertPage(res, item.name)
      sleep(0.3)
    }
  })

  group('health API', function () {
    const res = http.get(baseUrl + '/api/health', {
      tags: { page: 'health' },
      timeout: '30s',
    })
    const body = parseJson(res)
    const statusOk =
      body &&
      typeof body === 'object' &&
      body.status === 'ok'
    const degradedOk =
      allowDegradedHealth() &&
      res.status === 503 &&
      body &&
      typeof body === 'object' &&
      body.status === 'degraded'

    check(res, {
      'health responds 200 or 503': function (r) {
        return r.status === 200 || r.status === 503
      },
      'health has JSON body': function () {
        return body !== null
      },
      'health ok or allowed degraded': function () {
        return statusOk || degradedOk
      },
    })
  })

  group('protected dashboard redirects unauthenticated', function () {
    const res = http.get(baseUrl + '/dashboard', {
      redirects: 0,
      tags: { page: 'dashboard-gate' },
      timeout: '30s',
    })
    check(res, {
      'dashboard unauth redirects': function (r) {
        return isRedirectStatus(r.status)
      },
      'dashboard Location includes sign-in': function (r) {
        const loc = headerLocation(r)
        return /sign-in/i.test(loc)
      },
    })
  })

  sleep(0.5)
}
