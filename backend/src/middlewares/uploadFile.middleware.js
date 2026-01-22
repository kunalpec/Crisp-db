import multer from 'multer';
import path from 'path';

const allowedTypes = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'image/jpg',
  'image/gif',
  'video/mp4',
  'video/mkv',
  'video/avi',
  'audio/mpeg',
  'audio/wav',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

// PART-2
// storage config
const storage = multer.diskStorage({
  // destination of file to be stored...
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },

  // file name config
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// PART-1
// file filter (security)
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

export const uploadFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
