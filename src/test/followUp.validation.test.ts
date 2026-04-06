import { describe, it, expect } from "vitest";

// Mocking the validation logic used in the Edge Function
function validateAiResponse(result: any) {
  if (!result.subject || typeof result.subject !== "string" || result.subject.trim() === "") {
    throw new Error("AI response missing mandatory 'subject' field");
  }
  if (!result.body || typeof result.body !== "string" || result.body.trim() === "") {
    throw new Error("AI response missing mandatory 'body' field");
  }
  if (!["professional", "friendly", "concise"].includes(result.tone)) {
    throw new Error("AI response has invalid or missing 'tone'");
  }
  return true;
}

describe("Follow-up AI validation logic", () => {
  it("should pass for valid complete response", () => {
    const validResponse = {
      tone: "professional",
      subject: "Follow up: Frontend Engineer role",
      body: "Dear Hiring Manager, thank you for the interview..."
    };
    expect(validateAiResponse(validResponse)).toBe(true);
  });

  it("should throw error if subject is missing", () => {
    const invalidResponse = {
      tone: "professional",
      body: "Dear Hiring Manager, thank you for the interview..."
    };
    expect(() => validateAiResponse(invalidResponse)).toThrow("AI response missing mandatory 'subject' field");
  });

  it("should throw error if body is missing", () => {
    const invalidResponse = {
      tone: "professional",
      subject: "Follow up"
    };
    expect(() => validateAiResponse(invalidResponse)).toThrow("AI response missing mandatory 'body' field");
  });

  it("should throw error if tone is invalid", () => {
    const invalidResponse = {
      tone: "sarcastic",
      subject: "Follow up",
      body: "Text"
    };
    expect(() => validateAiResponse(invalidResponse)).toThrow("AI response has invalid or missing 'tone'");
  });
});
