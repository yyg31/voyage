const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { uploadDir, maxUploadMb } = require('../config/env');
const ApiError = require('../utils/ApiError');

const TICKETS_SUBDIR = 'tickets';
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

const ticketsPath = path.join(uploadDir, TICKETS_SUBDIR);
fs.mkdirSync(ticketsPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, ticketsPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(ApiError.badRequest(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
}

const uploadTicket = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});

module.exports = { uploadTicket, TICKETS_SUBDIR };
