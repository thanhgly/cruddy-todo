const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    if (err) {
      throw 'error!';
    }
    fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
      if (err) {
        throw 'error in creating file!';
      }
      items[id] = text;
      callback(null, { id, text});
    });
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, data) => {
    if (err) {
      throw 'error!';
    }
    var fileNames = _.map(data, (fileName) => {
      var id = fileName.slice(0, 5);
      var text;
      fs.readFile(`${exports.dataDir}/${fileName}`, (err, data) => {
        text = data;
      });
      return {id: id, text: id};
    });
    callback(err, fileNames);
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, data) => {
    if (err || data === undefined) {
      return callback(new Error(`No item with id: ${id}`));
    }
    var text = data.toString();

    callback(null, { id: id, text: text });
  });
};

exports.update = (id, text, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, originalText) => {
    if (err) {
      console.log('error in reading file in update');
      callback(err);
      return;
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
        if (err) {
          throw 'error in creating file!';
        }
        items[id] = text;
        callback(null, { id, text });
      });
    }
  });
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
