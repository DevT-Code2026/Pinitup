/**
 * Segmind API provider.
 *
 * Calls the Segmind endpoint via native fetch.
 * Reads SEGMIND_API_KEY and SEGMIND_ENDPOINT from environment variables.
 *
 * Authentication: x-api-key header (NOT Bearer token).
 * API keys use the format: SG_<32-char-alphanumeric>
 *
 * Supports synchronous and asynchronous workflows:
 *   - If the initial POST returns COMPLETED directly → return immediately.
 *   - If the initial POST returns QUEUED → poll poll_url every ~2.5 s
 *     until COMPLETED, FAILED, or timeout.
 *
 * Returns { imageUrl, rawResponse } in all success cases so the
 * execution service contract stays unchanged.
 */

const POLL_INTERVAL_MS = 2500; // 2.5 s between polls
const POLL_TIMEOUT_MS  = 90_000; // 90 s total polling budget

const SegmindProvider = {
  /**
   * Poll a Segmind poll_url until terminal state or timeout.
   *
   * @param {string}  pollUrl    - The URL returned in the QUEUED response.
   * @param {string}  apiKey     - Segmind API key.
   * @param {string}  requestId  - The request_id from the QUEUED response.
   * @returns {object}           - Final parsed JSON response.
   * @throws {Error}  On FAILED status or timeout.
   */
  async _poll(pollUrl, apiKey, requestId) {
    const start = Date.now();
    let attempt = 0;

    while (Date.now() - start < POLL_TIMEOUT_MS) {
      attempt += 1;
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      console.log(
        `[SegmindProvider] Poll attempt ${attempt} | ` +
        `requestId: ${requestId} | ` +
        `elapsed: ${elapsed}s`
      );

      const res = await fetch(pollUrl, {
        method: "GET",
        headers: { "x-api-key": apiKey },
      });

      console.log("[SegmindProvider] Poll HTTP Status:", res.status);

      if (!res.ok) {
        let body;
        try { body = await res.json(); } catch { body = await res.text().catch(() => ""); }
        console.error("[SegmindProvider] Poll HTTP error body:", body);
        throw new Error(
          `Segmind poll HTTP error: ${res.status} ${res.statusText} — ${JSON.stringify(body)}`
        );
      }

      const contentType = res.headers.get("content-type") || "";

      // Binary image → process immediately (treat as COMPLETED)
      if (contentType.includes("image/")) {
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = contentType.split(";")[0].trim();
        const imageUrl = `data:${mimeType};base64,${base64}`;

        console.log(
          `[SegmindProvider] Poll returned binary image | ` +
          `attempt: ${attempt} | size: ${buffer.byteLength} bytes`
        );

        return { status: "COMPLETED", imageUrl, raw: { type: "binary", mimeType, size: buffer.byteLength } };
      }

      const json = await res.json();
      const status = (json.status || "").toUpperCase();

      console.log(`[SegmindProvider] Poll status: ${status}`);

      if (status === "COMPLETED") {
        const imageUrl =
          json.image ||
          json.output ||
          json.result ||
          json.url ||
          json.image_url ||
          json.images?.[0] ||
          null;

        console.log("[SegmindProvider] Poll COMPLETED | imageUrl:", typeof imageUrl === "string" ? imageUrl.slice(0, 80) : imageUrl);
        console.log("[SegmindProvider] Final response:", JSON.stringify(json, null, 2));

        return { status: "COMPLETED", imageUrl: typeof imageUrl === "string" ? imageUrl : null, raw: json };
      }

      if (status === "FAILED") {
        const errMsg = json.error || json.message || JSON.stringify(json);
        console.error(`[SegmindProvider] Poll FAILED | attempt: ${attempt} | error: ${errMsg}`);
        throw new Error(`Segmind generation failed after ${attempt} poll(s): ${errMsg}`);
      }

      // Still QUEUED or PROCESSING → wait and retry
      console.log(`[SegmindProvider] Status "${status}" — waiting ${POLL_INTERVAL_MS / 1000}s before next poll`);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    // Timeout reached
    console.error(
      `[SegmindProvider] Poll timeout after ${POLL_TIMEOUT_MS / 1000}s | ` +
      `attempts: ${attempt} | requestId: ${requestId}`
    );
    throw new Error(
      `Segmind generation timed out after ${POLL_TIMEOUT_MS / 1000}s (${attempt} polls) — requestId: ${requestId}`
    );
  },

  /**
   * Generate an image via the Segmind API.
   *
   * @param {object} input - Payload to send to Segmind.
   * @param {string} [input.coupleImage] - Base64 or URL of the couple image.
   * @param {string} [input.memeImage]   - Base64 or URL of the meme image.
   * @returns {{ imageUrl: string|null, rawResponse: object }}
   * @throws {Error} If the API call fails or generation fails/times out.
   */
  async generate(input = {}) {
    const endpoint = process.env.SEGMIND_ENDPOINT;
    const apiKey   = process.env.SEGMIND_API_KEY;

    // Log env var presence (mask the full key)
    console.log("[SegmindProvider] SEGMIND_ENDPOINT loaded:", Boolean(endpoint));
    console.log("[SegmindProvider] SEGMIND_API_KEY loaded:", Boolean(apiKey));
    if (apiKey) {
      const masked = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
      console.log("[SegmindProvider] API key preview:", masked);
    }

    if (!endpoint || !apiKey) {
      throw new Error("Segmind API configuration missing: SEGMIND_ENDPOINT or SEGMIND_API_KEY not set");
    }

    const coupleImage = input.coupleImage;
    if (!coupleImage) {
      throw new Error("No image provided: input.coupleImage is required");
    }

    const memeImage = input.memeImage || process.env.SEGMIND_MEME_TEMPLATE_URL || "";

    const payload = {
      couple_image: coupleImage,
    };
    if (memeImage) {
      payload.meme_image = memeImage;
    }

    console.log("[SegmindProvider] Calling endpoint:", endpoint);
    console.log("[SegmindProvider] Payload:", JSON.stringify(payload, null, 2));

    // --- Initial POST --------------------------------------------------
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key":    apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[SegmindProvider] HTTP Status:", response.status);
    console.log("[SegmindProvider] Content-Type:", response.headers.get("content-type"));

    if (!response.ok) {
      let errorBody;
      try   { errorBody = await response.json(); }
      catch { errorBody = await response.text().catch(() => "Unable to read error body"); }
      console.error("[SegmindProvider] Error Body:", errorBody);
      throw new Error(
        `Segmind API error: ${response.status} ${response.statusText} — ${JSON.stringify(errorBody)}`
      );
    }

    const initialContentType = response.headers.get("content-type") || "";

    // Binary image → direct completion (synchronous endpoint)
    if (initialContentType.includes("image/")) {
      const buffer  = await response.arrayBuffer();
      const base64  = Buffer.from(buffer).toString("base64");
      const mimeType = initialContentType.split(";")[0].trim();
      const imageUrl = `data:${mimeType};base64,${base64}`;

      console.log("[SegmindProvider] Synchronous binary image received, size:", buffer.byteLength, "bytes");

      return {
        imageUrl,
        rawResponse: { type: "binary", mimeType, size: buffer.byteLength },
      };
    }

    // JSON response
    const json     = await response.json();
    const status   = (json.status || "").toUpperCase();
    const pollUrl  = json.poll_url  || null;
    const requestId = json.request_id || null;

    console.log("[SegmindProvider] Initial status:", status);
    console.log("[SegmindProvider] poll_url:", pollUrl);
    console.log("[SegmindProvider] request_id:", requestId);

    // --- Synchronous completion (status already COMPLETED or no poll_url) --
    if (status === "COMPLETED" || (!pollUrl && status !== "QUEUED")) {
      const imageUrl =
        json.image ||
        json.output ||
        json.result ||
        json.url ||
        json.image_url ||
        json.images?.[0] ||
        null;

      console.log("[SegmindProvider] Synchronous completion | imageUrl:", typeof imageUrl === "string" ? imageUrl.slice(0, 80) : imageUrl);

      return {
        imageUrl: typeof imageUrl === "string" ? imageUrl : null,
        rawResponse: json,
      };
    }

    // --- Asynchronous: QUEUED → poll -------------------------------------
    if (status === "QUEUED" && pollUrl) {
      console.log("[SegmindProvider] Workflow queued — starting poll loop");

      const pollResult = await this._poll(pollUrl, apiKey, requestId);

      return {
        imageUrl: pollResult.imageUrl || null,
        rawResponse: pollResult.raw || json,
      };
    }

    // Unknown initial state
    console.error("[SegmindProvider] Unexpected initial response:", JSON.stringify(json, null, 2));
    throw new Error(`Segmind returned unexpected status "${status}" with no poll_url`);
  },
};

export default SegmindProvider;
