import { NextRequest, NextResponse } from "next/server";
import { 
  LEETCODE_BASE_URL, 
  pollSubmissionStatus, 
  fetchWithRetry 
} from "@/lib/api-utils";

async function checkProblemExists(problemSlug: string, csrfToken: string) {
  try {
    const response = await fetchWithRetry(`${LEETCODE_BASE_URL}/problems/${problemSlug}`, {
      headers: {
        "x-csrftoken": csrfToken,
        "Origin": LEETCODE_BASE_URL
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ problemSlug: string }> }
) {
  const { problemSlug } = await params;
  const { lang, question_id, typed_code, data_input } = await request.json();
  const csrfToken = request.headers.get("x-csrftoken");

  if (!csrfToken) {
    return NextResponse.json({ 
      success: false,
      error: "Missing CSRF token" 
    }, { status: 400 });
  }

  try {
    const problemExists = await checkProblemExists(problemSlug, csrfToken);
    if (!problemExists) {
      return NextResponse.json({
        success: false,
        error: "Problem not found"
      }, { status: 404 });
    }

    if (!lang || !question_id || !typed_code) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: lang, question_id, or typed_code"
      }, { status: 400 });
    }

    const interpretResponse = await fetch(`${LEETCODE_BASE_URL}/problems/${problemSlug}/interpret_solution/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": csrfToken,
        "Origin": LEETCODE_BASE_URL,
        "Referer": `${LEETCODE_BASE_URL}/problems/${problemSlug}`
      },
      body: JSON.stringify({
        lang,
        question_id,
        typed_code,
        data_input
      })
    });

    const interpretData = await interpretResponse.json();
    const interpretResult = await pollSubmissionStatus(interpretData.interpret_id, problemSlug, csrfToken);

    if (interpretResult.state === "FAILURE" || interpretResult.status_msg !== "Accepted") {
      return NextResponse.json({
        phase: "interpretation",
        result: interpretResult
      });
    }

    const submitResponse = await fetch(`${LEETCODE_BASE_URL}/problems/${problemSlug}/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": csrfToken,
        "Origin": LEETCODE_BASE_URL,
        "Referer": `${LEETCODE_BASE_URL}/problems/${problemSlug}/`
      },
      body: JSON.stringify({
        lang,
        question_id,
        typed_code
      })
    });

    const submitData = await submitResponse.json();
    const submissionResult = await pollSubmissionStatus(submitData.submission_id, problemSlug, csrfToken);

    return NextResponse.json({
      success: true,
      interpretation: {
        interpret_id: interpretData.interpret_id,
        result: interpretResult
      },
      submission: {
        submission_id: submitData.submission_id,
        result: submissionResult
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Failed to process solution",
      details: error.message
    }, { status: 500 });
  }
}
