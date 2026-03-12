#!/bin/bash
export PATH="/Users/shakhzodkhamidov/.local/bin:$PATH"
export DATABASE_URL="file:./prisma/dev.db"
cd "$(dirname "$0")"
npm run dev
