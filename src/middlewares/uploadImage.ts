import multer, { MulterError } from "multer";
import path from "path";

// Multer disk storage config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, "_")
            .slice(0, 50);
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${base}-${uniqueSuffix}${ext}`);
    },
});

// Accept only common image mime types
const imageMimes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (imageMimes.has(file.mimetype)) return cb(null, true);
    cb(new MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1,
    },
});

// Optional helper to map Multer errors into 400 responses
export function handleMulterError(err: unknown) {
    if (err instanceof MulterError) {
        let message = "Upload error";
        if (err.code === "LIMIT_FILE_SIZE") message = "File too large (max 5MB)";
        if (err.code === "LIMIT_UNEXPECTED_FILE") message = "Only image files are allowed";
        return { status: 400, message } as const;
    }
    return null;
}