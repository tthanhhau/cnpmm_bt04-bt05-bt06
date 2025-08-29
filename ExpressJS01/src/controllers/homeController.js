function indexPage(req, res) {
  res.render('index', { title: 'ExpressJS01 API', time: new Date() });
}

function homepage(req, res) {
  // req.user is set by auth middleware
  res.json({ message: `Welcome, ${req.user?.name || 'guest'}!`, time: new Date() });
}

module.exports = { indexPage, homepage };
