/* =========================================================================
   Property Concierge — serverless endpoint
   POST /.netlify/functions/concierge  { question, history[] }  ->  { answer }

   The Anthropic API key is read from the ANTHROPIC_API_KEY environment
   variable and never leaves the server. The knowledge base below is a
   curated, organised extract of this property's verified documents —
   confidential fields (owner identity, keybox, private agent remarks,
   agent-only showing line) are deliberately excluded.
   ========================================================================= */

const MODEL = process.env.CONCIERGE_MODEL || 'claude-opus-5';
const MAX_QUESTION = 600;

/* ---------------------------- KNOWLEDGE BASE ---------------------------- */
/* Sources: NONE YET. Rebuild this from the intake documents — MLS printout,
   Tarrant Appraisal District account, HOA documents if any, upgrade schedule,
   comps — one numbered section per document class, as in the template.
   Until then the record holds only the address, so every factual question
   is handed to Mysti rather than answered.                               */

const KB = `
## 1. IDENTITY
Address: 5725 Trails Edge Ct, Arlington, TX 76017.
Listing agent: Mysti Stewart, Mysti Stewart Group, Compass RE Texas, LLC.

## 2. EVERYTHING ELSE — NOT YET IN THE RECORD
Price, MLS number, status, bedrooms, bathrooms, square footage, lot size, year built,
builder, rooms, features, systems, parking, HOA, taxes, special assessments (PID/MUD),
schools, neighborhood and every other property fact are NOT in this record yet.
For any of them, say you do not have that detail confirmed yet and that Mysti can
answer directly. Do not state any figure. Do not infer anything from the street name,
the ZIP code or general knowledge of Arlington.

## 3. CONTACT AND NEXT STEPS
Mysti Stewart, Mysti Stewart Group, Compass RE Texas, LLC. Texas license #0525273.
Phone and text: 214-213-3537. Email: mysti.stewart@compass.com.
Showings are by appointment. To schedule, point people to the contact form in the
Contact section of this page, or to calling/texting 214-213-3537.
`;

const SYSTEM = `You are the property concierge for the single-property website for
5725 Trails Edge Ct, Arlington, TX 76017, listed by Mysti Stewart of the
Mysti Stewart Group at Compass RE Texas, LLC.

SOURCE OF TRUTH
Answer ONLY from the PROPERTY RECORD below. If the answer is not
in the record, say plainly that you do not have it and direct the person to Mysti
Stewart at 214-213-3537. Never guess, never estimate a number that is not in the
record, and never fill a gap with general knowledge about Arlington, the area or the
market. Do not answer questions unrelated to this property — redirect politely.

SHAPE OF AN ANSWER
Aim for 40-100 words. Three beats, in prose, no headings and no bullet lists:
1. Answer the question directly.
2. Say briefly why it matters to a buyer.
3. Offer one logical next step or follow-up question.

HONESTY RULES — these override everything else
- For material facts (HOA dues and what they cover, taxes, special assessments,
  square footage, lot and common-area size, schools, permits, boundaries, amenities,
  appliances, parking, solar), open with a qualifier such as
  "Based on the available property information, ..."
  and add a short note that the figure should be verified during due diligence.
- Never guarantee: future appreciation, rental income or rentability, school
  attendance, tax amounts, or that any amenity exists or is privately owned.
- Never claim an amenity or feature the record does not name.
- Never name the systems the information came from. Do not say "the MLS", "NTREIS",
  "TAD", "DCAD", "the appraisal district", "the tax record" or "the listing" in an answer.
  Say "the property information", "the property details", or simply state the fact.
- Where records differ on a detail, give the figure most useful to a buyer and say
  plainly that it is worth confirming during due diligence. Do not narrate the
  discrepancy between sources.
- Present estimates as estimates and show the assumption behind them.

FAIR HOUSING
Never describe or characterise the people, demographics, religion, national origin,
family makeup, or "type of buyer" of the neighborhood or building, and never steer
anyone toward or away from an area on those grounds. Describe the property and
verifiable locations only. Do not assign rooms to particular kinds of occupants.

PRIVACY
Never reveal or speculate about the owner or occupant, showing instructions, lockbox
or access details, the seller's motivation, or any negotiation position. You do not
have this information and must not invent it.

TONE
Warm, precise, unhurried. Plain sentences. You are a knowledgeable assistant to a
serious buyer, not a hype machine. No exclamation marks, no "stunning" or "must see".
Never mention internal notes, missing paperwork, or how this page was assembled. If
something is not available here, simply say Mysti can get it for them.

PROPERTY RECORD
${KB}`;

/* ------------------------------- handler -------------------------------- */
const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

/* Every failure used to return the same opaque message, which made a missing
   API key indistinguishable from an undeployed function. Each failure now
   carries a `code` the widget can act on and a human can read directly. */
const fail = (code, message, status) => json({ error: message, code }, status);

/* Best-effort throttle, per warm instance. */
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const win = 60000, cap = 12;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) hits.clear();
  return list.length > cap;
}

/* The most common cause of a rejected key is a paste artefact, not a wrong key:
   a trailing newline from a copy, or quotes typed around the value in the
   Netlify UI. Both are safe to strip. Anything still malformed is reported
   precisely rather than sent to the API to fail. */
function readKey() {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) return { present: false };

  let key = String(raw).trim();
  const hadWhitespace = key !== String(raw);
  const hadQuotes = /^(['"]).*\1$/s.test(key);
  if (hadQuotes) key = key.slice(1, -1).trim();

  return {
    present: true,
    key,
    hadWhitespace,
    hadQuotes,
    // Format check only — no part of the secret is ever returned or logged.
    looksValid: /^sk-ant-/.test(key),
    length: key.length
  };
}

export default async (req) => {
  const k = readKey();
  const key = k.key;

  /* GET is a health check: open /.netlify/functions/concierge in a browser to
     see whether the function deployed and whether the key is configured.
     It reports only configuration status and never the key itself. */
  if (req.method === 'GET') {
    let hint;
    if (!k.present) {
      hint = 'Set ANTHROPIC_API_KEY in Netlify: Site configuration -> Environment variables, then redeploy.';
    } else if (!k.looksValid) {
      hint = 'The value does not start with "sk-ant-", so it is probably not an Anthropic API key. ' +
             'Create one at console.anthropic.com -> Settings -> API keys. Note that a Claude Pro or Max ' +
             'subscription does NOT include API access; the API is billed separately.';
    } else if (k.hadQuotes || k.hadWhitespace) {
      hint = 'The key had surrounding quotes or whitespace; they were stripped. ' +
             'Remove them in Netlify so the stored value is the bare key.';
    } else {
      hint = 'Function is deployed and the key is well-formed. If chat still fails, ' +
             'POST a question and read the returned code.';
    }
    return json({
      ok: Boolean(k.present && k.looksValid),
      function: 'deployed',
      model: MODEL,
      apiKeyConfigured: Boolean(k.present),
      apiKeyLooksValid: Boolean(k.present && k.looksValid),
      apiKeyLength: k.present ? k.length : 0,
      apiKeyHadQuotesOrWhitespace: Boolean(k.hadQuotes || k.hadWhitespace),
      hint
    }, k.present && k.looksValid ? 200 : 503);
  }

  if (req.method !== 'POST') return fail('method_not_allowed', 'Method not allowed', 405);

  if (!k.present) {
    console.error('ANTHROPIC_API_KEY is not set on this deploy.');
    return fail('not_configured',
      'The concierge is not configured on this deploy: ANTHROPIC_API_KEY is missing.', 503);
  }

  if (!k.looksValid) {
    console.error('ANTHROPIC_API_KEY does not look like an Anthropic key (length %d).', k.length);
    return fail('malformed_key',
      'The configured ANTHROPIC_API_KEY does not start with "sk-ant-", so it is probably not an ' +
      'Anthropic API key. A Claude Pro/Max subscription does not include API access.', 503);
  }

  if (k.hadQuotes || k.hadWhitespace) {
    console.warn('ANTHROPIC_API_KEY had surrounding quotes or whitespace; stripped before use.');
  }

  const ip = req.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (throttled(ip)) return fail('rate_limited', 'Too many questions, please slow down', 429);

  let payload;
  try { payload = await req.json(); }
  catch { return fail('bad_request', 'Invalid request', 400); }

  const question = String(payload?.question ?? '').trim().slice(0, MAX_QUESTION);
  if (!question) return fail('bad_request', 'Ask a question', 400);

  const history = Array.isArray(payload?.history)
    ? payload.history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-8)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }))
    : [];

  /* A trailing assistant turn is invalid as the last message; history is
     always followed by the new user turn, so just append. */
  const messages = [...history, { role: 'user', content: question }];

  try {
    /* Request shape notes for the Claude 5 family:
       - `temperature` / `top_p` / `top_k` were REMOVED and return a 400. Sending
         temperature is what broke every request on the first deploy.
       - Thinking is adaptive and ON by default, and thinking tokens count toward
         max_tokens, so 700 is not enough headroom for a reliable answer.
       - `output_config.effort` is GA (no beta header); "low" suits short factual
         answers drawn from a small knowledge base. */
    const callApi = (body) => fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const baseBody = { model: MODEL, max_tokens: 4000, system: SYSTEM, messages };
    let res = await callApi({ ...baseBody, output_config: { effort: 'low' } });

    /* Safety net: if this model or account rejects an optional parameter, retry
       once with the minimal valid body rather than failing the visitor. A
       degraded answer beats no answer, and the cause is logged either way. */
    if (res.status === 400) {
      const first = await res.clone().text().catch(() => '');
      console.error('Anthropic 400 with output_config; retrying minimal body.', first.slice(0, 300));
      res = await callApi(baseBody);
      if (res.ok) console.warn('Minimal-body retry succeeded — output_config is not accepted here.');
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Anthropic API error', res.status, detail.slice(0, 500));

      let upstreamType = '';
      try { upstreamType = JSON.parse(detail)?.error?.type || ''; } catch { /* not JSON */ }

      if (res.status === 401) {
        return fail('bad_api_key',
          'Anthropic rejected the API key as invalid. Confirm the key is active at ' +
          'console.anthropic.com and that it was pasted in full.', 502);
      }
      if (res.status === 403) {
        return fail('key_forbidden',
          'The key is recognised but not permitted to make this call — often no credit balance, ' +
          `or the workspace has no access to "${MODEL}". Check Plans & Billing in the Anthropic Console.`, 502);
      }
      if (upstreamType === 'billing_error' || /credit balance/i.test(detail)) {
        return fail('no_credit',
          'The Anthropic account has no credit balance. Add credits under Plans & Billing.', 502);
      }
      if (res.status === 404 || upstreamType === 'not_found_error') {
        return fail('model_unavailable',
          `This account cannot reach the model "${MODEL}". Set CONCIERGE_MODEL to one it can use.`, 502);
      }
      if (res.status === 429) {
        return fail('upstream_rate_limited', 'The Anthropic API is rate limiting this key.', 502);
      }
      if (res.status === 400) {
        let msg = '';
        try { msg = JSON.parse(detail)?.error?.message || ''; } catch { /* not JSON */ }
        return fail('bad_request_upstream',
          `The Anthropic API rejected the request: ${msg || 'invalid request'}`, 502);
      }
      return fail('upstream_error', `Anthropic API returned ${res.status}.`, 502);
    }

    const data = await res.json();

    /* Claude 5 models can decline a request (HTTP 200 + stop_reason "refusal"),
       so check stop_reason before reading content. */
    if (data?.stop_reason === 'refusal') {
      console.warn('Model refused', JSON.stringify(data?.stop_details || {}));
      return fail('refusal', 'The assistant declined to answer that one.', 502);
    }

    /* Thinking blocks are filtered out; only text reaches the visitor. */
    const answer = (data?.content ?? [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!answer) {
      const why = data?.stop_reason === 'max_tokens'
        ? 'The reply hit the token limit before any text was produced.'
        : 'The model returned no text.';
      console.error('Empty answer; stop_reason =', data?.stop_reason);
      return fail('empty_response', why, 502);
    }
    return json({ answer });
  } catch (err) {
    console.error('Concierge failure', err);
    return fail('network_error', `Could not reach the Anthropic API: ${err?.message || 'unknown error'}`, 502);
  }
};
