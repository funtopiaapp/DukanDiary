import { useState } from 'react'
import Tesseract from 'tesseract.js'
import { useToast } from '../hooks/useToast'
import { LoadingOverlay } from './LoadingSpinner'

export default function PhotoUploadOCR({ onDataExtracted, onImageSaved }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [showExtracted, setShowExtracted] = useState(false)
  const { addToast } = useToast()

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      addToast('Please select a JPEG, PNG, or WebP image', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be smaller than 5MB', 'error')
      return
    }

    try {
      // Show preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target.result)
      }
      reader.readAsDataURL(file)

      // Extract text with OCR
      setLoading(true)
      addToast('Extracting text from image...', 'info')

      const {
        data: { text }
      } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing') {
            console.log(`Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      setExtractedText(text)
      setShowExtracted(true)
      addToast('Text extracted! Review and confirm details.', 'success')

      // Save image reference
      if (onImageSaved) {
        onImageSaved({
          image: file,
          preview: event.target.result,
          extractedText: text
        })
      }
    } catch (error) {
      addToast('Failed to extract text from image', 'error')
      console.error('OCR Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmText = () => {
    if (onDataExtracted) {
      onDataExtracted(extractedText)
    }
    setShowExtracted(false)
    setPreview(null)
    setExtractedText('')
  }

  return (
    <div>
      <LoadingOverlay isLoading={loading} message="Extracting text from image..." />

      {/* Upload Section */}
      {!preview && (
        <div
          onClick={() => document.getElementById('photo-upload')?.click()}
          style={{
            border: '2px dashed #7dd3fc',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: '#f0f9ff',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Take or upload a photo
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Receipt, bill, or document photo
          </div>
        </div>
      )}

      {/* Preview & Extracted Text */}
      {preview && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <img
              src={preview}
              alt="Upload preview"
              style={{
                maxWidth: '100%',
                maxHeight: '300px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          {showExtracted && extractedText && (
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #7dd3fc',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '12px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
                📋 Extracted Text (Review):
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#333',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace'
                }}
              >
                {extractedText}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            {showExtracted && (
              <button
                className="btn-primary"
                onClick={handleConfirmText}
                style={{ flex: 1 }}
              >
                Use Extracted Details
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={() => {
                setPreview(null)
                setExtractedText('')
                setShowExtracted(false)
              }}
              style={{ flex: 1 }}
            >
              Try Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
