// Regression test for the PR template (issue #28). Squash merges use the PR body as the commit
// message, and GitHub closes any issue referenced by a closing keyword in it, even inside HTML
// comments. The template must therefore never contain a closing keyword followed by a real number.
const fs = require('node:fs');
const path = require('node:path');

const template = fs.readFileSync(
  path.join(__dirname, '.github', 'pull_request_template.md'),
  'utf8',
);

// GitHub closing keywords: https://docs.github.com/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue
const closingKeywordWithNumber =
  /\b(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s*:?\s+#\d+/i;

describe('pull request template', () => {
  it('does not reference a real issue with a closing keyword', () => {
    expect(template).not.toMatch(closingKeywordWithNumber);
  });

  it('keeps an empty "Closes #" line for the author to complete', () => {
    expect(template).toMatch(/^Closes #\s*$/m);
  });
});
