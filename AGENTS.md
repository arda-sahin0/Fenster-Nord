# Working rules for AI coding agents

These rules apply to every agent working in this repository (Claude Code, Codex, Cursor, and others).

## Before changing anything

- Read README.md and the files you are about to change.
- Check what is already in the working tree (`git status`) and pull before you start.
- Keep dependency versions pinned. Upgrade only when asked.

## While working

- Make small, focused changes in the style of the existing code.
- Run the tests after every behavior change.
- Add a regression test only when it catches a named bug, and say which bug in a comment.
- Keep comments short and useful to the next reader. No notes to yourself.
- On Windows, watch for: CLIs installed as `.cmd` files (they need the shell), backslash paths, CRLF line endings, and PowerShell writing UTF-8 with a BOM. See docs/windows-notes.md.

## Secrets and private state

- Keep keys, seeds, and tokens in `.env` or under `.local/`. Both are git-ignored.
- Never print secrets in output, logs, or commit messages.
- Never commit `.env`, `.local/`, generated state, private logs, or credentials.
- Before making a repository public, search its whole history for secrets.

## Actions with outside effects

- Ask the owner before anything that leaves this machine or costs money: pushing, publishing, deploying, sending messages, creating accounts or cloud resources, paying, or writing to a blockchain.
- If an outside action has an uncertain outcome, inspect the saved state before retrying. Never repeat it blindly.

## Reporting

- Claim only what you measured. Link the evidence (test output, transaction ID, URL, log line).
- Say plainly what failed, what was skipped, and what is still open.
- Track open issues in docs/open-problems.md. Move fixed ones to its Solved section with the commit hash.

## Git

- Pull before you push. Do not overwrite other people's work.
- Write commit messages that say what changed and why.
- Push only when the owner asks, or has said to push automatically.
