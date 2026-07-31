import test from 'node:test'
import assert from 'node:assert/strict'
import { convertQuantity } from './appModel.js'

test('convierte cantidades entre unidades compatibles', () => {
  assert.equal(convertQuantity(2, 'kg', 'g'), 2000)
  assert.equal(convertQuantity(1500, 'g', 'kg'), 1.5)
  assert.equal(convertQuantity(5, 'l', 'ml'), 5000)
  assert.equal(convertQuantity(2, 'm', 'km'), 0.002)
})

test('devuelve el valor original cuando la conversión no es compatible', () => {
  assert.equal(convertQuantity(3, 'kg', 'ud'), 3)
})
