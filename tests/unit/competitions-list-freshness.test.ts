import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("la liste des compétitions relit la feuille après une modification directe", async () => {
  const [page, data] = await Promise.all([
    readFile("app/dashboard/competitions/page.tsx", "utf8"),
    readFile("lib/competitions/data.ts", "utf8"),
  ])

  assert.match(data, /getCompetitions\(options\?:\s*\{\s*bypassCache\?:\s*boolean\s*\}\)/)
  assert.match(page, /getCompetitions\(\{\s*bypassCache:\s*true\s*\}\)/)
})

test("la fiche compétition relit les programmes après une modification directe", async () => {
  const [page, data] = await Promise.all([
    readFile("app/dashboard/competitions/[id]/page.tsx", "utf8"),
    readFile("lib/competitions/data.ts", "utf8"),
  ])

  assert.match(data, /getCompetitionPrograms\(competitionId\?:\s*string,\s*options:\s*\{\s*bypassCache\?:\s*boolean\s*\}\s*=\s*\{\}\)/)
  assert.match(page, /getCompetitionPrograms\(id,\s*\{\s*bypassCache:\s*true\s*\}\)/)
})
