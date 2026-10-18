import { describe, expect, test } from 'vitest'
import {
  MSG, contactSchema, fieldErrors, isPortfolio, leadSchema, normalizePkMobile,
  partnerSchema, projectStep1, projectStep2, projectStep3, projectStep4,
} from '@/lib/rules'

describe('normalizePkMobile', () => {
  test.each([
    ['0300 1234567', '+923001234567'],
    ['+92 300 1234567', '+923001234567'],
    ['0092-311-1555264', '+923111555264'],
    ['3001234567', '+923001234567'],
    ['+92 300-123 4567', '+923001234567'],
  ])('accepts %s', (input, out) => expect(normalizePkMobile(input)).toBe(out))

  test.each(['03001234', '042 35761234', '+1 415 555 0100', '', '0300 abc 1234567'])('rejects %s', (input) =>
    expect(normalizePkMobile(input)).toBeNull())
})

describe('isPortfolio', () => {
  test.each(['instagram.com/yourstudio', 'https://behance.net/sara', '@sara.designs', 'www.studio.pk'])('accepts %s', (s) =>
    expect(isPortfolio(s)).toBe(true))
  test.each(['my portfolio', 'hello', '@a', 'http://'])('rejects %s', (s) => expect(isPortfolio(s)).toBe(false))
})

describe('project steps', () => {
  test('step 1 requires a space', () => {
    expect(fieldErrors(projectStep1, {})).toEqual({ space: MSG.space })
    expect(fieldErrors(projectStep1, { space: 'Kitchen' })).toEqual({})
  })
  test('step 2 requires city and service; size optional but sane', () => {
    expect(fieldErrors(projectStep2, { size: '' })).toEqual({ city: MSG.city, service: MSG.service })
    expect(fieldErrors(projectStep2, { city: 'Lahore', service: 'Renovation', size: '-4' })).toEqual({ size: MSG.size })
    expect(fieldErrors(projectStep2, { city: 'Lahore', service: 'Renovation', size: '' })).toEqual({})
  })
  test('step 3 requires style and budget', () => {
    expect(fieldErrors(projectStep3, {})).toEqual({ style: MSG.style, budget: MSG.budget })
  })
  test('step 4 requires name and a PK mobile, email optional', () => {
    expect(fieldErrors(projectStep4, { name: ' ', phone: '', email: '', whatsappUpdates: true })).toEqual({
      name: MSG.fullName, phone: MSG.phoneRequired,
    })
    expect(fieldErrors(projectStep4, { name: 'Ayesha Khan', phone: '0300 12', email: '', whatsappUpdates: true })).toEqual({
      phone: MSG.phoneInvalid,
    })
    expect(fieldErrors(projectStep4, { name: 'Ayesha', phone: '03001234567', email: 'nope', whatsappUpdates: false })).toEqual({
      email: MSG.email,
    })
  })
  test('accepts an Urdu name unchanged', () => {
    const r = projectStep4.safeParse({ name: 'عائشہ خان', phone: '0300 1234567', email: '', whatsappUpdates: true })
    expect(r.success && r.data.name).toBe('عائشہ خان')
  })
})

describe('partner and contact', () => {
  test('partner needs at least one specialty and a portfolio', () => {
    const e = fieldErrors(partnerSchema, { role: 'Designer', name: 'Sara', business: '', city: 'Lahore', phone: '03001234567', portfolio: '', specialties: [] })
    expect(e).toEqual({ portfolio: MSG.portfolioRequired, specialties: MSG.specialties })
  })
  test('contact accepts an email or a phone, normalised', () => {
    const base = { name: 'Ali', topic: 'Something else', message: 'Hello there, a question.' }
    const a = contactSchema.parse({ ...base, contact: 'Ali@Example.com ' })
    expect(a.contact).toBe('ali@example.com')
    const b = contactSchema.parse({ ...base, contact: '0300 1234567' })
    expect(b.contact).toBe('+923001234567')
    expect(fieldErrors(contactSchema, { ...base, contact: 'ali at home' })).toEqual({ contact: MSG.contactInvalid })
    expect(fieldErrors(contactSchema, { ...base, contact: 'a@b.co', message: 'short' })).toEqual({ message: MSG.message })
  })
})

test('leadSchema discriminates on type and strips unknown keys', () => {
  const r = leadSchema.parse({
    type: 'contact', name: 'Ali', contact: 'ali@example.com', topic: 'Something else',
    message: 'Hello there, a question.', admin: true,
  })
  expect(r.type).toBe('contact')
  expect('admin' in r).toBe(false)
})
