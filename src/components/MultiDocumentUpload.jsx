import { useCallback, useState } from 'react'

const MultiDocumentUpload = () => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  // Supported image types for preview
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const pdfType = 'application/pdf'

  const handleFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: imageTypes.includes(file.type)
        ? URL.createObjectURL(file)
        : null,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles)
      }
    },
    [handleFiles],
  )

  const handleFileInput = useCallback(
    (e) => {
      const selectedFiles = e.target.files
      if (selectedFiles.length > 0) {
        handleFiles(selectedFiles)
      }
      // Reset input to allow selecting the same file again
      e.target.value = ''
    },
    [handleFiles],
  )

  const handleRemove = useCallback((id) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (imageTypes.includes(type)) {
      return (
        <svg
          className="h-8 w-8 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    }
    if (type === pdfType) {
      return (
        <svg
          className="h-8 w-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      )
    }
    return (
      <svg
        className="h-8 w-8 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send files to a server
    console.log('Submitting files:', files)
    alert(`Successfully uploaded ${files.length} file(s)!`)
  }

  return (
    <div className="relative w-full">
      <h2 className="mb-4 text-center text-2xl font-semibold text-slate-100">
        Multi-Document Upload
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-400/10'
              : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <svg
              className={`mb-4 h-16 w-16 transition-colors ${
                isDragging ? 'text-cyan-400' : 'text-slate-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-lg font-medium text-slate-200">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="mb-4 text-sm text-slate-400">
              or click the button below to browse
            </p>
            <label className="cursor-pointer rounded-full border border-white/20 bg-white/5 px-6 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:bg-white/10 focus-within:outline focus-within:outline-2 focus-within:outline-cyan-300/60">
              <span>Select Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200">
              Uploaded Files ({files.length})
            </h3>
            <div className="space-y-2">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-900/40 to-slate-800/30 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition hover:border-white/20"
                >
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/5">
                        {getFileIcon(fileItem.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-200">
                      {fileItem.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {formatFileSize(fileItem.size)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(fileItem.id)}
                    className="flex-shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-red-500/20 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/60"
                    aria-label={`Remove ${fileItem.name}`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {files.length > 0 && (
          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-teal-500/30 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            >
              Submit {files.length} File{files.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default MultiDocumentUpload

