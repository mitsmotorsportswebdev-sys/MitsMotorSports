import assert from 'node:assert/strict'
import test from 'node:test'
import { z } from 'zod'
import { imageType, projectPatchSchema } from './team-utils.js'

test('team schemas trim values and reject unknown fields', () => {
  const result = projectPatchSchema.safeParse({ title: '  Aethon  ', unknown: true })
  assert.equal(result.success, false)
  const valid = projectPatchSchema.safeParse({ title: '  Aethon  ' })
  assert.equal(valid.success, true)
  assert.equal(valid.data.title, 'Aethon')
  assert.equal(z.string().max(80).safeParse('x'.repeat(81)).success, false)
})
test('image type check validates magic bytes', () => {
  assert.equal(imageType(Buffer.from([0xff, 0xd8, 0xff, 0x00])), 'image/jpeg')
  assert.equal(imageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png')
  assert.equal(imageType(Buffer.from('RIFFxxxxWEBPdata')), 'image/webp')
  assert.equal(imageType(Buffer.from('<svg></svg>')), null)
})
test('project links accept only fragments, site paths, and HTTPS URLs', () => {
  for (const primaryCtaHref of ['#team', '/events', 'https://example.com/x']) {
    const result = projectPatchSchema.safeParse({ primaryCtaHref })
    assert.equal(result.success, true, `Expected valid link ${primaryCtaHref}`)
  }
  for (const primaryCtaHref of ['javascript:alert(1)', 'data:text/html,x', '//evil.com', 'http://example.com', 'https://', '  #team  x']) {
    const result = projectPatchSchema.safeParse({ primaryCtaHref })
    assert.equal(result.success, false, `Expected invalid link ${primaryCtaHref}`)
  }
})
test('spec icons accept short identifiers only', () => {
  for (const icon of ['gauge', 'battery-full']) {
    assert.equal(projectPatchSchema.safeParse({ specs: [{ label: 'Power', value: '9 kW', icon }] }).success, true, `Expected valid icon ${icon}`)
  }
  for (const icon of ['<img>', 'a b', 'a'.repeat(31)]) {
    assert.equal(projectPatchSchema.safeParse({ specs: [{ label: 'Power', value: '9 kW', icon }] }).success, false, `Expected invalid icon ${icon}`)
  }
})
