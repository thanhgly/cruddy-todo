const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const fsPromises = require('fs').promises;
//const readFilePromise = Promise.promisify(fs.readFile);

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
  // fsPromises.readdir(exports.dataDir)
  //   .then((files) => {

  //   })


  // return Promise.all;
  fs.readdir(exports.dataDir, (err, data) => {
    if (err) {
      return callback(err);
    }
    var fileNames = _.map(data, (fileName) => {
      var id = fileName.slice(0, 5);
      return fsPromises.readFile(`${exports.dataDir}/${fileName}`).
        then((fileData) => {
          return {id: id, text: fileData.toString()};
        });
    });
    Promise.all(fileNames)
      .then((files) => {
        callback(null, files);
      });
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
  fs.rm(`${exports.dataDir}/${id}.txt`, (err) => {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
