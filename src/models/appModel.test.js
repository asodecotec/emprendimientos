import test from 'node:test'
import assert from 'node:assert/strict'
import { convertQuantity, getProductCost } from './appModel.js'

test('convierte cantidades entre unidades compatibles', () => {
  assert.equal(convertQuantity(2, 'kg', 'g'), 2000)
  assert.equal(convertQuantity(1500, 'g', 'kg'), 1.5)
  assert.equal(convertQuantity(5, 'l', 'ml'), 5000)
  assert.equal(convertQuantity(2, 'm', 'km'), 0.002)
})

test('devuelve el valor original cuando la conversión no es compatible', () => {
  assert.equal(convertQuantity(3, 'kg', 'ud'), 3)
})

test('calcula el costo del producto con materiales como mapa', () => {
  const materials = [
    { id: 'mat-1', cost: 10 },
    { id: 'mat-2', cost: 5 },
  ]
  const product = {
    materials: { 'mat-1': { quantity: 3 }, 'mat-2': { quantity: 2 } },
  }
  assert.equal(getProductCost(product, materials), 40)
})

test('ignora materiales inexistentes al calcular el costo', () => {
  const product = {
    materials: { 'mat-1': { quantity: 2 }, 'mat-2': { quantity: 1 } },
  }
  const materials = [{ id: 'mat-1', cost: 10 }]
  assert.equal(getProductCost(product, materials), 20)
})
