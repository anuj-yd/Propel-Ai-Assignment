const Pole = require('../models/Pole');

class PoleRepository {
  async findByPoleId(poleId) {
    return await Pole.findOne({ poleId });
  }

  async getAllPoles() {
    return await Pole.find({});
  }

  async updatePole(poleId, updateData) {
    return await Pole.findOneAndUpdate({ poleId }, updateData, { new: true });
  }

  async savePole(poleData) {
    const pole = new Pole(poleData);
    return await pole.save();
  }
}

module.exports = new PoleRepository();
