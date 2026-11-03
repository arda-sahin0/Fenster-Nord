#!/usr/bin/env sh
# Publish a built folder to the gh-pages branch, without touching the working tree or the current branch.
#   scripts/publish-gh-pages.sh [folder]        (default folder: site)
# GitHub Pages must be set to "Deploy from a branch: gh-pages, / (root)".
# A free GitHub account serves Pages only from public repositories.
set -eu
dir="${1:-site}"
[ -d "$dir" ] || { echo "No folder '$dir'. Build the site first." >&2; exit 1; }
touch "$dir/.nojekyll"

index="$(mktemp)"
rm -f "$index"
GIT_INDEX_FILE="$index" git --work-tree="$dir" add -A .
tree="$(GIT_INDEX_FILE="$index" git write-tree)"
rm -f "$index"

git fetch -q origin gh-pages 2>/dev/null || true
parent="$(git rev-parse -q --verify origin/gh-pages || true)"
commit="$(git commit-tree "$tree" ${parent:+-p "$parent"} -m "Publish $dir")"
git update-ref refs/heads/gh-pages "$commit"
git push origin gh-pages
echo "Published $dir to gh-pages. GitHub needs about a minute to update the site."
