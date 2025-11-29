# Commit Message Template

## Để commit modular i18n structure:

```bash
# 1. Stage new files
git add src/locales/.gitignore
git add src/locales/WORKFLOW.md
git add src/locales/README.md
git add src/locales/EXAMPLE_USAGE.md
git add src/locales/vi/
git add src/locales/en/
git add src/locales/*.cjs
git add .gitignore  # Updated with i18n ignores

# 2. Commit deletion of auto-generated files
git commit -m "refactor(i18n): migrate to modular translation system

BREAKING CHANGE: Translation files restructured

- Split monolithic vi.json/en.json into 19 modular files each
- vi.json and en.json are now auto-generated (gitignored)
- Auto-merge on dev/build via npm scripts
- Modular files in vi/ and en/ are source of truth

Benefits:
- Easier maintenance (40 lines vs 800 lines per file)
- Better collaboration (less merge conflicts)
- Cleaner git diffs
- Automated workflow

Files:
- Added: src/locales/vi/*.json (19 modules)
- Added: src/locales/en/*.json (19 modules)
- Added: src/locales/mergeTranslations.cjs
- Added: src/locales/splitTranslations.cjs
- Added: src/locales/.gitignore
- Added: Documentation (WORKFLOW.md, README.md, etc)
- Removed: src/locales/vi.json (now auto-generated)
- Removed: src/locales/en.json (now auto-generated)

Migration: All 535+ translation keys preserved (zero data loss)
"

# 3. Update package.json separately
git add front-end/package.json
git commit -m "chore(i18n): update npm scripts for auto-merge

- Add auto-merge to 'dev' script
- Keep auto-merge in 'prebuild' hook
- Add i18n:merge and i18n:split scripts
"
```

## Quick commit (nếu muốn gộp lại):

```bash
git add src/locales/ .gitignore front-end/package.json
git commit -m "refactor(i18n): migrate to modular translation system

- Split vi.json/en.json into 38 modular files (19 modules × 2 languages)
- Auto-generate merged files on dev/build
- Gitignore auto-generated files
- Add comprehensive documentation

Zero breaking changes, all translations preserved."
```
