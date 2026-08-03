import { useState } from 'react'
import { starterData } from '../models/appModel'

export function useAppState() {
  const [records, setRecords] = useState(starterData)

  return {
    records,
    setRecords,
  }
}
