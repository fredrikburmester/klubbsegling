module.exports = {
	ensureAuthenticated: function (req, res, next) {
		if (req.isAuthenticated()) {
			return next()
		}
		req.flash('error_msg', 'Du är inte inloggad, var god logga in')
		res.redirect('/users/login')
	},
}
