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

  async getPolesByIds(poleIds) {
    return await Pole.find({ poleId: { $in: poleIds } });
  }

  async updatePoleStatus(poleId, energized) {
    return await Pole.findOneAndUpdate({ poleId }, { energized }, { new: true });
  }
}

module.exports = new PoleRepository();
