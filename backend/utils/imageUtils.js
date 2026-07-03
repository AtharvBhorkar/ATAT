const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Process and optimize an uploaded image
 * - Converts to WebP format
 * - Resizes to max dimensions
 * - Creates thumbnail
 */
async function processImage(inputPath, outputPath, options = {}) {
    const {
        maxWidth = 1200,
        maxHeight = 800,
        thumbMaxWidth = 400,
        thumbMaxHeight = 300,
        quality = 80,
        createThumbnail = true
    } = options;

    try {
        // Get image metadata
        const metadata = await sharp(inputPath).metadata();
        
        // Calculate dimensions maintaining aspect ratio
        let width = metadata.width;
        let height = metadata.height;

        if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
        }

        // Process main image
        const outputWebp = outputPath.replace(/\.[^.]+$/, '.webp');
        await sharp(inputPath)
            .resize(width, height, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality })
            .toFile(outputWebp);

        // Create thumbnail
        let thumbnailPath = null;
        if (createThumbnail) {
            const thumbDir = path.join(path.dirname(outputPath), 'thumbs');
            if (!fs.existsSync(thumbDir)) {
                fs.mkdirSync(thumbDir, { recursive: true });
            }
            const thumbName = `thumb_${path.basename(outputWebp)}`;
            thumbnailPath = path.join(thumbDir, thumbName);

            let thumbWidth = metadata.width;
            let thumbHeight = metadata.height;
            if (thumbWidth > thumbMaxWidth) {
                thumbHeight = Math.round((thumbHeight * thumbMaxWidth) / thumbWidth);
                thumbWidth = thumbMaxWidth;
            }
            if (thumbHeight > thumbMaxHeight) {
                thumbWidth = Math.round((thumbWidth * thumbMaxHeight) / thumbHeight);
                thumbHeight = thumbMaxHeight;
            }

            await sharp(inputPath)
                .resize(thumbWidth, thumbHeight, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 70 })
                .toFile(thumbnailPath);
        }

        // Delete original file if it's not webp
        if (path.extname(inputPath).toLowerCase() !== '.webp') {
            fs.unlinkSync(inputPath);
        }

        return {
            original: outputWebp.replace(/\\/g, '/'),
            thumbnail: thumbnailPath ? thumbnailPath.replace(/\\/g, '/') : null
        };
    } catch (error) {
        console.error('Image processing error:', error);
        throw error;
    }
}

/**
 * Delete image files from disk
 */
function deleteImage(imagePath) {
    if (!imagePath) return;
    
    const pathsToDelete = [imagePath];
    
    // Also try to find and delete thumbnail
    const dir = path.dirname(imagePath);
    const thumbsDir = path.join(dir, 'thumbs');
    const filename = path.basename(imagePath);
    pathsToDelete.push(path.join(thumbsDir, `thumb_${filename}`));

    pathsToDelete.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete ${filePath}:`, err);
            }
        }
    });
}

/**
 * Get full URL for an image path
 */
function getImageUrl(imagePath) {
    if (!imagePath) return '';
    
    // If already a full URL or data URI, or starts with a slash, return as-is
    if (imagePath.startsWith('http://') || 
        imagePath.startsWith('https://') || 
        imagePath.startsWith('data:') || 
        imagePath.startsWith('/')) {
        return imagePath;
    }

    return `/${imagePath}`;
}

module.exports = {
    processImage,
    deleteImage,
    getImageUrl
};