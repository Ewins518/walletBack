
exports.poll = (fn) => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        return fn()
          .then(resolve)
          .catch(reject)
          .finally(() => clearInterval(interval));
      }, 60);
    });
  }
  
  