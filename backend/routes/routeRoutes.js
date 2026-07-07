/**
 * ROUTE CALCULATION SERVICE
 * Uses OpenRouteService (ORS) API to calculate distance & duration
 * API key is kept SECRET on the backend
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

const ORS_API_KEY = process.env.ORS_API_KEY;

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Geocode a location string to coordinates using ORS Pelias
// ════════════════════════════════════════════════════════════════════════════
async function geocodeLocation(locationName) {
  if (!locationName || !locationName.trim()) {
    throw new Error('Location name cannot be empty');
  }

  try {
    const url = 'https://api.openrouteservice.org/geocode/search';
    const response = await axios.get(url, {
      params: {
        api_key: ORS_API_KEY,
        text: locationName.trim(),
        size: 1
      },
      timeout: 5000
    });

    const features = response.data?.features || [];
    if (features.length === 0) {
      throw new Error(`Location not found: "${locationName}"`);
    }

    const coords = features[0].geometry.coordinates; // [longitude, latitude]
    const label = features[0].properties?.label || locationName;

    return {
      name: label,
      lat: coords[1],
      lng: coords[0],
      coordinates: coords // Keep both formats for flexibility
    };
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('ORS API Key invalid or expired');
    }
    throw error;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER: Get route distance & duration from ORS directions API
// ════════════════════════════════════════════════════════════════════════════
async function getRouteData(pickupCoords, dropoffCoords) {
  try {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car';

    const response = await axios.post(
      url,
      {
        coordinates: [
          [pickupCoords[0], pickupCoords[1]], // [lng, lat]
          [dropoffCoords[0], dropoffCoords[1]]
        ],
        instructions: true
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );

    const routes = response.data?.routes || [];
    if (routes.length === 0) {
      throw new Error('No route found between locations');
    }

    const route = routes[0];
    const summary = route.summary || {};

    const distanceMeters = summary.distance || 0;
    const durationSeconds = summary.duration || 0;

    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10; // Round to 1 decimal
    const durationMinutes = Math.ceil(durationSeconds / 60);
    const durationHours = Math.floor(durationMinutes / 60);
    const remainingMins = durationMinutes % 60;
    const durationText = durationHours > 0 
      ? `${durationHours}h ${remainingMins}m` 
      : `${durationMinutes}m`;

    return {
      distanceKm,
      durationMinutes,
      durationText,
      distanceMeters,
      durationSeconds
    };
  } catch (error) {
    console.error('❌ ORS Directions API error:', error.message);
    throw new Error(`Route calculation failed: ${error.message}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/route/calculate
// Calculates distance & duration for a pickup → dropoff route
// ════════════════════════════════════════════════════════════════════════════
router.post('/calculate', async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    // Validation
    if (!pickup || !pickup.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Pickup location is required'
      });
    }

    if (!dropoff || !dropoff.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Drop-off location is required'
      });
    }

    if (pickup.trim().toLowerCase() === dropoff.trim().toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and drop-off locations cannot be the same'
      });
    }

    console.log(`📍 Calculating route: ${pickup} → ${dropoff}`);

    // Step 1: Geocode pickup location
    const pickupGeo = await geocodeLocation(pickup);
    console.log(`  ✓ Pickup geocoded: ${pickupGeo.name}`);

    // Step 2: Geocode dropoff location
    const dropoffGeo = await geocodeLocation(dropoff);
    console.log(`  ✓ Dropoff geocoded: ${dropoffGeo.name}`);

    // Step 3: Get route distance & duration
    const routeData = await getRouteData(pickupGeo.coordinates, dropoffGeo.coordinates);
    console.log(`  ✓ Route calculated: ${routeData.distanceKm} km, ${routeData.durationText}`);

    // Success response
    res.status(200).json({
      success: true,
      route: {
        pickupName: pickupGeo.name,
        dropoffName: dropoffGeo.name,
        distanceKm: routeData.distanceKm,
        durationMinutes: routeData.durationMinutes,
        durationText: routeData.durationText,
        distanceMeters: routeData.distanceMeters,
        durationSeconds: routeData.durationSeconds
      }
    });

  } catch (error) {
    console.error('❌ /api/route/calculate error:', error.message);

    // Handle different error types
    let statusCode = 500;
    let userMessage = error.message;

    if (error.message.includes('not found')) {
      statusCode = 404;
    } else if (error.message.includes('API Key')) {
      statusCode = 503;
      userMessage = 'Route service temporarily unavailable. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/route/batch
// Calculate multiple routes at once (for optimization)
// ════════════════════════════════════════════════════════════════════════════
router.post('/batch', async (req, res) => {
  try {
    const { routes } = req.body; // Array of { pickup, dropoff }

    if (!Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'routes array is required and must not be empty'
      });
    }

    const results = [];

    for (const route of routes) {
      try {
        const pickupGeo = await geocodeLocation(route.pickup);
        const dropoffGeo = await geocodeLocation(route.dropoff);
        const routeData = await getRouteData(pickupGeo.coordinates, dropoffGeo.coordinates);

        results.push({
          success: true,
          pickup: route.pickup,
          dropoff: route.dropoff,
          distanceKm: routeData.distanceKm,
          durationText: routeData.durationText
        });
      } catch (err) {
        results.push({
          success: false,
          pickup: route.pickup,
          dropoff: route.dropoff,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ /api/route/batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch route calculation failed'
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ENDPOINT: GET /api/route/health
// Check if ORS API is accessible
// ════════════════════════════════════════════════════════════════════════════
router.get('/health', async (req, res) => {
  try {
    if (!ORS_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'ORS_API_KEY not configured'
      });
    }

    // Try a simple geocoding request
    const testResponse = await axios.get('https://api.openrouteservice.org/geocode/search', {
      params: {
        api_key: ORS_API_KEY,
        text: 'Mumbai',
        size: 1
      },
      timeout: 3000
    });

    if (testResponse.data?.features?.length > 0) {
      res.json({
        success: true,
        message: 'ORS API is operational'
      });
    } else {
      res.status(503).json({
        success: false,
        message: 'ORS API returned no data'
      });
    }
  } catch (error) {
    console.error('❌ ORS Health check failed:', error.message);
    res.status(503).json({
      success: false,
      message: `ORS API unavailable: ${error.message}`
    });
  }
});

module.exports = router;