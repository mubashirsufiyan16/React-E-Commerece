import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  deleteOrderFromHistory,
  getOrderHistory,
  ORDER_HISTORY_STORAGE_KEY,
} from '../src/services/orderService.js'

function withStorage(run) {
  const previousWindow = globalThis.window
  const localValues = new Map()
  const sessionValues = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => localValues.get(key) ?? null,
      setItem: (key, value) => localValues.set(key, String(value)),
      removeItem: (key) => localValues.delete(key),
    },
    sessionStorage: {
      getItem: (key) => sessionValues.get(key) ?? null,
      setItem: (key, value) => sessionValues.set(key, String(value)),
      removeItem: (key) => sessionValues.delete(key),
    },
  }

  try {
    run(localValues, sessionValues)
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window
    } else {
      globalThis.window = previousWindow
    }
  }
}

function makeOrder(number) {
  return {
    number,
    status: 'simulated',
    items: [{ quantity: 1, lineTotal: 25 }],
    total: 25,
    placedAt: '2026-11-03T12:00:00.000Z',
  }
}

test('deletes an order from saved history', () => {
  withStorage((localStorage) => {
    const orders = [makeOrder('SH-SECOND'), makeOrder('SH-FIRST')]
    localStorage.set(ORDER_HISTORY_STORAGE_KEY, JSON.stringify(orders))

    deleteOrderFromHistory('SH-SECOND')

    assert.deepEqual(
      JSON.parse(localStorage.get(ORDER_HISTORY_STORAGE_KEY)),
      [orders[1]],
    )
  })
})

test('deleting the legacy order prevents it from being restored', () => {
  withStorage((localStorage, sessionStorage) => {
    const order = makeOrder('SH-LEGACY')
    localStorage.set(ORDER_HISTORY_STORAGE_KEY, JSON.stringify([order]))
    sessionStorage.set('stylehub-last-order', JSON.stringify(order))

    deleteOrderFromHistory(order.number)

    assert.deepEqual(getOrderHistory(), [])
    assert.equal(sessionStorage.has('stylehub-last-order'), false)
  })
})
