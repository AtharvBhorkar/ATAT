const express = require('express');
const router = express.Router();
const Package = require('../models/Package');
const verifyAdmin = require('../middleware/verifyAdmin');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { processImage, deleteImage, getImageUrl } = require('../utils/imageUtils');

function mapPackage(p) {
    let primaryImage = p.image;
    if (!primaryImage || primaryImage === 'undefined') {
        primaryImage = (p.images && p.images.length > 0) ? p.images[0] : '';
    }

    return {
        _id: p._id,
        title: p.title || p.name || '',
        name: p.name || p.title || '',
        slug: p.slug || '',
        category: p.category || '',
        destination: p.destination || '',
        state: p.state || '',
        duration: p.duration || '',
        durationNights: p.durationNights || p.durationDays || 1,
        durationDays: p.durationDays || 1,
        price: p.price || 0,
        originalPrice: p.originalPrice || null,
        discountPrice: p.discountPrice || null,
        description: p.description || '',
        includes: p.includes || [],
        excludes: p.excludes || [],
        // ✅ FIXED: Return full image URLs using utility
        image: getImageUrl(primaryImage),
        images: (p.images || []).map(img => getImageUrl(img)),
        active: p.active !== false,
        isActive: p.active !== false,
        status: p.active !== false ? 'active' : 'disabled',
        featured: p.featured || false,
        rating: p.rating || 0,
        totalBookings: p.totalBookings || 0,
        maxPeople: p.maxPeople || 10,
        minPeople: p.minPeople || 1,
        difficulty: p.difficulty || 'easy',
        itinerary: p.itinerary || [],
        amenities: p.amenities || [],
        highlights: p.highlights || [],
        reviews: p.reviews || [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
    };
}

// ✅ PUBLIC - Get all packages
router.get('/', async (req, res) => {
    try {
        const { category, search, featured, sort, page = 1, limit = 100, active } = req.query;
        const query = {};

        if (active !== undefined) query.active = active === 'true';
        if (category && category !== 'all') query.category = category;
        if (featured !== undefined) query.featured = featured === 'true';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { state: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'popular') sortOption = { totalBookings: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };

        const packages = await Package.find(query).sort(sortOption).limit(parseInt(limit));
        const mapped = packages.map(mapPackage);

        res.json({ success: true, data: mapped, packages: mapped, total: mapped.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ PUBLIC - Get single package
router.get('/:slug', async (req, res) => {
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.slug);
        const pkg = await Package.findOne(
            isObjectId
                ? { $or: [{ _id: req.params.slug }, { slug: req.params.slug }] }
                : { slug: req.params.slug }
        );
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
        res.json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Create package WITH IMAGE
router.post('/', 
    verifyAdmin, 
    uploadSingle, 
    handleUploadError, 
    async (req, res) => {
    try {
        const data = { ...req.body };

        // Handle JSON string fields
        ['includes', 'excludes', 'itinerary', 'amenities', 'highlights', 'reviews'].forEach(field => {
            if (typeof data[field] === 'string') {
                try { data[field] = JSON.parse(data[field]); } catch(e) { data[field] = []; }
            }
        });

        // Process uploaded image
        if (req.file) {
            try {
                const processed = await processImage(req.file.path, req.file.path.replace(/\.[^.]+$/, '.webp'));
                data.image = processed.original;
            } catch (imgErr) {
                console.error('Image processing failed:', imgErr);
                data.image = req.file.path;
            }
        } else if (req.body.imageUrl) {
            data.image = req.body.imageUrl;
        }

        const pkg = await Package.create(data);
        res.status(201).json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Package slug already exists.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Update package WITH IMAGE
router.put('/:id', 
    verifyAdmin, 
    uploadSingle, 
    handleUploadError, 
    async (req, res) => {
    try {
        const data = { ...req.body };

        // Handle JSON string fields
        ['includes', 'excludes', 'itinerary', 'amenities', 'highlights', 'reviews'].forEach(field => {
            if (typeof data[field] === 'string') {
                try { data[field] = JSON.parse(data[field]); } catch(e) { data[field] = []; }
            }
        });

        const oldPkg = await Package.findById(req.params.id);
        
        // Process new image
        if (req.file) {
            try {
                const processed = await processImage(req.file.path, req.file.path.replace(/\.[^.]+$/, '.webp'));
                if (oldPkg && oldPkg.image) deleteImage(oldPkg.image);
                data.image = processed.original;
            } catch (imgErr) {
                data.image = req.file.path;
            }
        } else if (req.body.imageUrl) {
            if (oldPkg && oldPkg.image && !oldPkg.image.startsWith('http')) {
                deleteImage(oldPkg.image);
            }
            data.image = req.body.imageUrl;
        } else if (req.body.removeImage === 'true') {
            if (oldPkg && oldPkg.image) deleteImage(oldPkg.image);
            data.image = '';
        }

        const pkg = await Package.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
        res.json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Upload gallery images
router.post('/:id/gallery', 
    verifyAdmin, 
    uploadMultiple, 
    handleUploadError, 
    async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });

        const newImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const processed = await processImage(file.path, file.path.replace(/\.[^.]+$/, '.webp'));
                    newImages.push(processed.original);
                } catch (err) {
                    newImages.push(file.path);
                }
            }
        }

        pkg.images = [...(pkg.images || []), ...newImages];
        await pkg.save();

        res.json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Delete gallery image
router.delete('/:id/gallery/:index', verifyAdmin, async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });

        const index = parseInt(req.params.index);
        if (index >= 0 && index < (pkg.images || []).length) {
            deleteImage(pkg.images[index]);
            pkg.images.splice(index, 1);
            await pkg.save();
        }

        res.json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Toggle active
router.patch('/:id/toggle', verifyAdmin, async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
        pkg.active = !pkg.active;
        await pkg.save();
        res.json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Toggle featured
router.patch('/:id/featured', verifyAdmin, async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });
        pkg.featured = !pkg.featured;
        await pkg.save();
        res.json({ success: true, data: mapPackage(pkg) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADMIN - Delete package
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found.' });

        // Delete images
        if (pkg.image) deleteImage(pkg.image);
        if (pkg.images) pkg.images.forEach(img => deleteImage(img));

        res.json({ success: true, message: 'Package deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;