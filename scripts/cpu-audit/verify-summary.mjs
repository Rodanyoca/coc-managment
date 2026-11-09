import fs from 'node:fs'
import assert from 'node:assert/strict'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const src=fs.readFileSync('components/dashboard/general-summary-section.tsx','utf8')
const compiled=ts.transpileModule(src,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022},reportDiagnostics:true})
assert.equal(compiled.diagnostics.length,0)
fs.mkdirSync('.cache/summary-validation',{recursive:true});fs.writeFileSync('.cache/summary-validation/component.mjs',compiled.outputText)
const {GeneralSummarySection}=await import(new URL('../../.cache/summary-validation/component.mjs',import.meta.url))
const props={federations:{totalFederations:1},territorial:{totalStructures:2},actors:{totalActors:3},activities:{totalActivities:4},competitions:{totalCompetitions:5,aVenir:1,enCours:2,terminees:2,totalResults:6,medals:{total:9,or:4,argent:3,bronze:2}},nationalTeams:{totalTeams:7,activeTeams:3,totalMembers:12},documents:{totalDocuments:8,avecFichier:5,sansFichier:3}}
const render=input=>renderToStaticMarkup(React.createElement(GeneralSummarySection,input))
const html=render(props)
assert.equal((html.match(/relative min-h-32/g)||[]).length,9);assert.match(html,/lg:grid-cols-3/);assert.match(html,/4 or · 3 argent · 2 bronze/)
assert(!render({...props,competitions:undefined}).includes('Médailles'))
assert.match(render({...props,competitions:{...props.competitions,medals:{total:0,or:0,argent:0,bronze:0}}}),/0 or · 0 argent · 0 bronze/)
console.log('Summary HTML: nine KPI, grid, medal counts/zero and conditional visibility verified; no authenticated browser claim.')
