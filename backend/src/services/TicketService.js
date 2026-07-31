const ticketRepository = require('../repositories/TicketRepository');
const poleRepository = require('../repositories/PoleRepository');
const NodeGeocoder = require('node-geocoder');
const { v4: uuidv4 } = require('uuid');

const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

class TicketService {
  constructor() {
    this.io = null;
  }

  setSocketIo(io) {
    this.io = io;
  }

  async generateTicket(faultResult) {
    console.log(`[TicketService] Generating ticket for ${faultResult.type}...`);

    let pincode = 'UNKNOWN';
    
    // 1. Fetch poles in boundary to get pincode
    if (faultResult.boundary && faultResult.boundary.length > 0) {
      const poles = await poleRepository.getPolesByIds(faultResult.boundary);
      
      // Try to find a pincode attached directly to the poles
      const poleWithPincode = poles.find(p => p.pincode);
      
      if (poleWithPincode && poleWithPincode.pincode) {
        pincode = poleWithPincode.pincode;
      } else if (poles.length > 0) {
        // Fallback: Geocode the first pole's lat/lng using OpenStreetMap (free, no API key)
        try {
          const lat = poles[0].lat;
          const lon = poles[0].lng || poles[0].lon;
          if (lat && lon) {
             const geoResult = await geocoder.reverse({ lat, lon });
             if (geoResult && geoResult.length > 0 && geoResult[0].zipcode) {
                pincode = geoResult[0].zipcode;
             }
          }
        } catch (error) {
          console.warn('[TicketService] Geocoding failed, degrading gracefully:', error.message);
        }
      }
    }

    const ticketData = {
      ticketId: uuidv4(),
      faultType: faultResult.type,
      boundary: faultResult.boundary,
      pincode: pincode,
      status: 'OPEN',
      details: faultResult.details
    };

    const newTicket = await ticketRepository.createTicket(ticketData);
    console.log(`[TicketService] Ticket created: ${newTicket.ticketId} with PIN: ${pincode}`);

    // Emit to frontend (if websocket is configured)
    if (this.io) {
      this.io.emit('NEW_TICKET', newTicket);
    }

    return newTicket;
  }
}

module.exports = new TicketService();
