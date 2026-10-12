"""Post an AGENTS.md-aware code review on a pull request using the Albert API.

Reads the PR diff, picks the AGENTS.md files that cover the changed paths, and
asks an Albert API chat model to review the diff against those rules. The
result is posted as a single PR comment, updated in place on later pushes.
"""

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

ALBERT_BASE_URL = os.environ.get("ALBERT_BASE_URL", "https://albert.api.etalab.gouv.fr/v1")
ALBERT_MODEL = os.environ.get("ALBERT_MODEL", "gemma-4-31b-it")
ALBERT_API_KEY = os.environ.get("ALBERT_API_KEY", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "")
BASE_REF = os.environ.get("PR_BASE_REF", "")
PR_NUMBER = os.environ.get("PR_NUMBER", "")

COMMENT_MARKER = "<!-- albert-code-review -->"
MAX_DIFF_CHARS = 24000

# path prefix -> AGENTS.md that governs it, most specific first
SCOPED_AGENTS = [
    ("web/", "web/AGENTS.md"),
    ("quality-tools/", "quality-tools/AGENTS.md"),
]
ROOT_AGENTS = "AGENTS.md"


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def get_diff():
    diff = run(["git", "diff", f"origin/{BASE_REF}...HEAD"])
    if len(diff) > MAX_DIFF_CHARS:
        diff = diff[:MAX_DIFF_CHARS] + "\n\n[diff truncated]"
    return diff


def get_changed_paths():
    out = run(["git", "diff", "--name-only", f"origin/{BASE_REF}...HEAD"])
    return [line for line in out.splitlines() if line]


def collect_agents_instructions(changed_paths):
    files = [ROOT_AGENTS]
    for prefix, agents_file in SCOPED_AGENTS:
        if any(p.startswith(prefix) for p in changed_paths):
            files.append(agents_file)

    sections = []
    for path in files:
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            sections.append(f"### {path}\n\n{f.read()}")
    return "\n\n".join(sections)


def build_prompt(diff, agents_instructions):
    system = (
        "You are a code reviewer for the EVERSE TechRadar repository. "
        "Review the pull request diff strictly against the AGENTS.md instructions given below. "
        "Flag only real violations or defects you can point to in the diff -- do not invent "
        "issues, do not restate the rules, and do not comment on style choices the rules don't "
        "cover. If the diff is clean, say so in one line. Keep the review short: a bullet list "
        "of concrete findings (file, what's wrong, why it violates the rule), or 'No issues found.' "
        "Write in plain, direct English."
    )
    user = f"AGENTS.md instructions:\n\n{agents_instructions}\n\n---\n\nPull request diff:\n\n{diff}"
    return system, user


def call_albert(system, user):
    if not ALBERT_MODEL:
        raise SystemExit(
            "ALBERT_MODEL is not set. List available models with "
            "`curl https://albert.api.etalab.gouv.fr/v1/models -H \"Authorization: Bearer $ALBERT_API_KEY\"` "
            "and set the ALBERT_MODEL repository variable."
        )

    body = json.dumps(
        {
            "model": ALBERT_MODEL,
            "temperature": 0.1,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        f"{ALBERT_BASE_URL}/chat/completions",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {ALBERT_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            payload = json.load(resp)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Albert API error {e.code}: {e.read().decode('utf-8', 'replace')}")

    return payload["choices"][0]["message"]["content"].strip()


def github_api(method, path, data=None):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        data=json.dumps(data).encode("utf-8") if data is not None else None,
        method=method,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def find_existing_comment():
    comments = github_api("GET", f"/repos/{GITHUB_REPOSITORY}/issues/{PR_NUMBER}/comments")
    for c in comments:
        if COMMENT_MARKER in c.get("body", ""):
            return c["id"]
    return None


def post_review(review_text):
    body = f"{COMMENT_MARKER}\n## Albert API review\n\n{review_text}"
    existing_id = find_existing_comment()
    if existing_id:
        github_api("PATCH", f"/repos/{GITHUB_REPOSITORY}/issues/comments/{existing_id}", {"body": body})
    else:
        github_api("POST", f"/repos/{GITHUB_REPOSITORY}/issues/{PR_NUMBER}/comments", {"body": body})


def main():
    if not (ALBERT_API_KEY and GITHUB_TOKEN and GITHUB_REPOSITORY and BASE_REF and PR_NUMBER):
        print("Missing required environment variables.", file=sys.stderr)
        sys.exit(1)

    diff = get_diff()
    if not diff.strip():
        print("No diff to review.")
        return

    changed_paths = get_changed_paths()
    agents_instructions = collect_agents_instructions(changed_paths)
    system, user = build_prompt(diff, agents_instructions)
    review_text = call_albert(system, user)
    post_review(review_text)
    print(review_text)


if __name__ == "__main__":
    main()
