
import { getIsMongoConnected, readLocalDB, writeLocalDB } from '../config/db.js';

// Random ID generator for local mode
function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export class MernModel {



  constructor(mongooseModel, jsonKey) {
    this.mongooseModel = mongooseModel;
    this.jsonKey = jsonKey;
  }

  // Find all matches based on query filter
  async find(filter = {}) {
    if (getIsMongoConnected()) {
      return this.mongooseModel.find(filter).lean();
    } else {
      const db = readLocalDB();
      let results = db[this.jsonKey] || [];

      // Basic matching filter
      return results.filter((item) => {
        for (const key in filter) {
          if (filter[key] !== undefined) {
            // Handle nested userId or direct fields
            if (item[key] !== filter[key]) return false;
          }
        }
        return true;
      });
    }
  }

  // Find single match based on query filter
  async findOne(filter) {
    if (getIsMongoConnected()) {
      return this.mongooseModel.findOne(filter).lean();
    } else {
      const db = readLocalDB();
      const results = db[this.jsonKey] || [];
      const found = results.find((item) => {
        for (const key in filter) {
          if (item[key] !== filter[key]) return false;
        }
        return true;
      });
      return found || null;
    }
  }

  // Find by ID
  async findById(id) {
    if (getIsMongoConnected()) {
      return this.mongooseModel.findById(id).lean();
    } else {
      const db = readLocalDB();
      const results = db[this.jsonKey] || [];
      const found = results.find((item) => item._id === id);
      return found || null;
    }
  }

  // Create document
  async create(data) {
    if (getIsMongoConnected()) {
      const doc = new this.mongooseModel(data);
      const saved = await doc.save();
      return saved.toObject();
    } else {
      const db = readLocalDB();
      const newItem = {
        _id: generateId(),
        ...data,
        createdAt: new Date().toISOString()
      };
      if (!db[this.jsonKey]) {
        db[this.jsonKey] = [];
      }
      db[this.jsonKey].push(newItem);
      writeLocalDB(db);
      return newItem;
    }
  }

  // Find by ID and Update
  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    if (getIsMongoConnected()) {
      return this.mongooseModel.findByIdAndUpdate(id, updateData, options).lean();
    } else {
      const db = readLocalDB();
      const results = db[this.jsonKey] || [];
      const index = results.findIndex((item) => item._id === id);
      if (index === -1) return null;

      // Filter out operator keys like $set in case students do {$set: ...}
      let realUpdate = { ...updateData };
      if (updateData.$set) {
        realUpdate = { ...realUpdate, ...updateData.$set };
        delete realUpdate.$set;
      }

      results[index] = {
        ...results[index],
        ...realUpdate,
        updatedAt: new Date().toISOString()
      };
      db[this.jsonKey] = results;
      writeLocalDB(db);
      return results[index];
    }
  }

  // Find by ID and Delete
  async findByIdAndDelete(id) {
    if (getIsMongoConnected()) {
      return this.mongooseModel.findByIdAndDelete(id).lean();
    } else {
      const db = readLocalDB();
      const results = db[this.jsonKey] || [];
      const index = results.findIndex((item) => item._id === id);
      if (index === -1) return null;

      const deleted = results[index];
      results.splice(index, 1);
      db[this.jsonKey] = results;
      writeLocalDB(db);
      return deleted;
    }
  }

  // Delete matching records
  async deleteOne(filter) {
    if (getIsMongoConnected()) {
      const res = await this.mongooseModel.deleteOne(filter);
      return { deletedCount: res.deletedCount || 0 };
    } else {
      const db = readLocalDB();
      const results = db[this.jsonKey] || [];
      const initialLength = results.length;
      const filtered = results.filter((item) => {
        for (const key in filter) {
          if (item[key] === filter[key]) return false;
        }
        return true;
      });
      db[this.jsonKey] = filtered;
      writeLocalDB(db);
      return { deletedCount: initialLength - filtered.length };
    }
  }
}