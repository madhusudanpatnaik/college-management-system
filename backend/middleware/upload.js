// Shared multer upload configuration.
//
// Assignment, material, and submission routes previously each defined an
// identical multer storage/limits/fileFilter block plus a removeUploadedFile
// helper. They now share this factory; the only per-route difference is the
// stored-filename prefix.
//
// Two-stage validation:
//   1. multer fileFilter (pre-write) — allowlist by extension. multer only sees
//      the filename/MIME here, not the bytes, so this is a coarse first gate.
//   2. verifyFileSignature (post-write) — reads the file header off disk and
//      confirms the magic bytes match the claimed extension, then deletes the
//      file if they don't. This is what stops a renamed executable/script from
//      slipping through on a permitted extension.

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Belt-and-suspenders: reject obviously executable/script payloads even before
// the allowlist check, regardless of declared MIME type.
const BLOCKED_EXTENSIONS = /\.(exe|bat|cmd|sh|php|jar|msi|dll|com|scr|ps1|py|rb|pl)$/i;

// Extension → accepted magic-byte signatures. An empty array means the type is
// allowed but signature-less (plain text), so it is accepted on extension alone.
// Signatures are compared from offset 0.
const SIGNATURES = {
  pdf: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  png: [[0x89, 0x50, 0x4e, 0x47]], // .PNG
  jpg: [[0xff, 0xd8, 0xff]],
  jpeg: [[0xff, 0xd8, 0xff]],
  gif: [[0x47, 0x49, 0x46, 0x38]], // GIF8
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF (WEBP marker lives at offset 8)
  // OOXML (docx/xlsx/pptx) and zip archives are all PKZIP containers.
  zip: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]],
  docx: [[0x50, 0x4b, 0x03, 0x04]],
  xlsx: [[0x50, 0x4b, 0x03, 0x04]],
  pptx: [[0x50, 0x4b, 0x03, 0x04]],
  // Legacy Office (OLE2 compound document).
  doc: [[0xd0, 0xcf, 0x11, 0xe0]],
  xls: [[0xd0, 0xcf, 0x11, 0xe0]],
  ppt: [[0xd0, 0xcf, 0x11, 0xe0]],
  // Signature-less text formats.
  txt: [],
  csv: []
};

const ALLOWED_EXTENSIONS = new Set(Object.keys(SIGNATURES));

function extensionOf(filename) {
  return path.extname(String(filename || "")).slice(1).toLowerCase();
}

function isAllowedFilename(filename) {
  return !BLOCKED_EXTENSIONS.test(filename) && ALLOWED_EXTENSIONS.has(extensionOf(filename));
}

function createUploader(prefix) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
      cb(null, `${Date.now()}-${prefix}-${safeName}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      if (!isAllowedFilename(file.originalname)) {
        // Tag as a client error so the central handler returns 400, not 500.
        const error = new Error("This file type is not allowed.");
        error.status = 400;
        error.code = "INVALID_FILE_TYPE";
        return cb(error, false);
      }
      cb(null, true);
    }
  });
}

// Read the first `length` bytes of a file without loading the whole thing.
function readHeader(filePath, length) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
}

function signatureMatches(ext, header) {
  const signatures = SIGNATURES[ext];
  if (!signatures) {
    return false; // extension not on the allowlist
  }
  if (signatures.length === 0) {
    return true; // signature-less allowed type (txt/csv)
  }
  return signatures.some((signature) => signature.every((byte, index) => header[index] === byte));
}

// Post-upload middleware: confirm the file content matches its extension, and
// delete + reject on mismatch. No-ops when the route made the upload optional
// and no file was sent.
function verifyFileSignature(req, res, next) {
  if (!req.file) {
    return next();
  }

  const ext = extensionOf(req.file.originalname);

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "This file type is not allowed." });
  }

  try {
    const header = readHeader(req.file.path, 8);
    if (!signatureMatches(ext, header)) {
      removeUploadedFile(req.file);
      return res.status(400).json({ message: "The uploaded file's content does not match its type." });
    }
  } catch (_error) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "The uploaded file could not be verified." });
  }

  return next();
}

function removeUploadedFile(file) {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

module.exports = { createUploader, verifyFileSignature, removeUploadedFile, uploadsDir };
