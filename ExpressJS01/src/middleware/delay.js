// Optional artificial delay for demo/testing
function delay(ms = 300) {
  return function(req, res, next) {
    setTimeout(next, ms);
  };
}
module.exports = delay;
