#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
exec node node_modules/next/dist/bin/next dev --webpack --port "${PORT:-3000}"
