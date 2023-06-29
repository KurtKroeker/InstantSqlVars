# Instant SQL Vars README

Given a query that has references to SQL variables (e.g. @foo), generate declaration stubs for them for faster query debugging.

## Features

For the query in the active window, parses out the SQL variables and generates a DECLARE block with placeholders for you to provide. This functionality is available for:

- All query statements in the active window
- All query statements in the current selection of text

## Requirements

n/a

## Extension Settings

n/a

## Known Issues

- May duplicate variable declarations

## Build Instructions

Create a VISX extention package using the following instructions:
```
npm install -g @vscode/vsce
cd InstantSqlVars
vsce package
# The InstantSqlVars.vsix file has now been generated
```
You should be able to install the VISX file in Azure Data Studio.

## Release Notes

### 1.0.0

Initial release.