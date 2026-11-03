# Windows notes

Pitfalls that cost time before, and the fix for each.

## Starting CLIs from Node

npm installs command-line tools as `name.cmd`. `execFileSync('name')` fails with `ENOENT`, and Node runs a `.cmd` file only through the shell.
Use `execFileSync('name.cmd', args, {shell: true})` on Windows, and allow only plain arguments (IDs, flags, paths) because the shell does not escape them.

## Paths

- `new URL(import.meta.url).pathname` gives `/C:/...`. Use `fileURLToPath(import.meta.url)`.
- A CLI may print a path with a trailing backslash. Strip `[\\/]+$` before comparing.

## Line endings

Git on Windows converts LF to CRLF on checkout. Files that are hashed or compared byte for byte break.
List them as `-text` in `.gitattributes`, then delete and check them out again.

## PowerShell

- `Set-Content -Encoding utf8` writes a BOM in Windows PowerShell 5.1. A `.env` file with a BOM loses its first key. Remove it, or write the file from Node or Git Bash.
- `&&` does not exist in PowerShell 5.1. Use `cmd1; if ($?) { cmd2 }`.

## Long-running services

- Services started from an AI agent session can stop when that session pauses or the laptop sleeps. Start them in your own terminals.
- Keep the laptop plugged in and awake during anything with a deadline.
- A program reads `.env` only when it starts. Restart it after changing `.env`.

## Free AI tiers

- Free tiers have a daily request quota per model, and models get overloaded at peak times (HTTP 503).
- Keep a fallback model configured, and test it before you need it.
