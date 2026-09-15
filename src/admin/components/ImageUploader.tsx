import { useRef, useState } from 'react'
import { ImagePlus, LoaderCircle, X } from 'lucide-react'
import { adminApi } from '../services/api'
import type { ImageAsset } from '../types'

interface ImageUploaderProps {
  page: string
  value?: ImageAsset
  onChange: (image?: ImageAsset) => void
}

export default function ImageUploader({ page, value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function selectFile(file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Use a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Images must be 5 MB or smaller.')
      return
    }
    setError('')
    setLoading(true)
    try {
      onChange(await adminApi.uploadImage(page, file))
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-uploader">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => selectFile(event.target.files?.[0])} />
      {value?.url ? <div className="admin-image-preview"><img src={value.url} alt="Uploaded preview" /><button type="button" aria-label="Remove image" onClick={() => onChange(undefined)}><X size={16} /></button></div> : <button type="button" className={`admin-dropzone ${dragging ? 'is-dragging' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]) }}>
        {loading ? <LoaderCircle className="admin-spin" size={22} /> : <ImagePlus size={22} />}
        <span>{loading ? 'Uploading image...' : 'Drop image here or browse'}</span><small>JPEG, PNG, WebP up to 5 MB</small>
      </button>}
      {error && <p className="admin-field-error">{error}</p>}
    </div>
  )
}
