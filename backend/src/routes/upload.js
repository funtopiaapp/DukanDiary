import express from 'express'
import multer from 'multer'
import pdfParse from 'pdf-parse'
import * as XLSX from 'xlsx'
import { AppError } from '../middleware/errorHandler.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError('Only PDF and Excel files are allowed', 400))
    }
  }
})

// POST file upload and parse
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    throw new AppError('No file provided', 400)
  }

  try {
    let rows = []

    if (req.file.mimetype === 'application/pdf') {
      rows = await parsePDF(req.file.buffer)
    } else {
      rows = parseExcel(req.file.buffer)
    }

    res.json({
      success: true,
      file_name: req.file.originalname,
      file_type: req.file.mimetype,
      rows_extracted: rows.length,
      data: rows
    })
  } catch (error) {
    throw new AppError(`Error parsing file: ${error.message}`, 500)
  }
})

const parsePDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer)
    const text = data.text

    // Simple text parsing - extract lines with numbers
    const lines = text.split('\n').filter(line => line.trim().length > 0)

    // Convert lines to structured rows
    const rows = lines.map((line, index) => ({
      row_number: index + 1,
      content: line.trim(),
      has_numbers: /\d/.test(line)
    }))

    return rows
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`)
  }
}

const parseExcel = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    // Convert to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet)

    // Clean and structure the data
    const cleanedRows = rows.map((row, index) => ({
      row_number: index + 1,
      data: Object.entries(row).map(([key, value]) => ({
        column: key,
        value: value
      }))
    }))

    return cleanedRows
  } catch (error) {
    throw new Error(`Excel parsing failed: ${error.message}`)
  }
}

export default router
