# Plugin Store

The idea is to provide the user a quick way to discover and install plugins via the plugin store.

# Contributing

We have a set of ESLint rules that define clear syntax rules (web/.eslintrc.json). You will need the following tools:

* ESLint (The pluggable linting utility for JavaScript and JSX) https://eslint.org/

We will not accept patches introducing non-ESLint-compliant code.

## Linting via pre-commit hook

Set up the pre-commit hook:

In the root directory of your Git repository, navigate to the `.git/hooks` folder.
Create or edit the pre-commit file (with no file extension) in that folder.

If you only want to use our pre-commit hook:

```bash
cp ./extras/scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x ./git/hooks/pre-commit
chmod +x .extras/scripts/pre-commit
```