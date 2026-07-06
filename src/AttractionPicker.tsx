import { useState } from "react";

type AttractionPickerProps = {
  options: { id: string; name: string }[]
  onAdd: (id: string) => void
}

function AttractionPicker({ options, onAdd }: AttractionPickerProps) {
  const [selectedId, setSelectedId] = useState('')

  return (
    <div>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="" disabled>Choose an attraction…</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
      <button disabled={!selectedId} onClick={() => onAdd(selectedId)}>Add</button>
    </div>
  )
}

export default AttractionPicker
