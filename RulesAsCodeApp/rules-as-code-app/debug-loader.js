
const llmOutput = {
  "result": {
    "sections": [
      {
        "id": "sec-1",
        "title": "Purpose and Scope",
        "content": "Article 1...",
        "referenceId": "Article 1"
      }
    ]
  },
  "confidence": 0.95
};

function unwrapInputText(input) {
  if (input == null) return "";

  if (typeof input === "string") {
    const s = input.trim();
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return unwrapInputText(JSON.parse(s));
      } catch {
        return input;
      }
    }
    return input;
  }

  if (typeof input === "object") {
    const obj = input;
    if ("text" in obj) {
      return unwrapInputText(obj.text);
    }
  }

  return ""; 
}

function buildReadable(src) {
    const sections = src?.result?.sections ?? [];
    if (!Array.isArray(sections) || sections.length === 0) {
      return "FALLBACK_JSON: " + JSON.stringify(src, null, 2);
    }
    return sections.map(s => `ID: ${s.id}`).join("\n");
}

console.log("--- TEST 1: unwrapInputText with llmOutput ---");
const unwrapped = unwrapInputText(llmOutput);
console.log("Unwrapped:", JSON.stringify(unwrapped));
console.log("Is Empty?", unwrapped === "");

console.log("\n--- TEST 2: buildReadable with llmOutput ---");
const readable = buildReadable(llmOutput);
console.log("Readable starts with:", readable.substring(0, 50));
console.log("Readable is JSON?", readable.startsWith("FALLBACK_JSON"));

console.log("\n--- TEST 3: buildReadable with STRINGIFIED llmOutput ---");
try {
    const s = JSON.stringify(llmOutput);
    const r = buildReadable(s);
    console.log("String input Readable:", r.substring(0, 50));
} catch(e) { console.log(e); }
