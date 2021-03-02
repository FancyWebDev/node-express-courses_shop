const keys = require('../keys')

module.exports = function(email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Restoring access',
    html: `
      <h1>Forgot your password</h1>
      <p>If not, then ignore this letter</p>
      <p>Otherwise click on the link below</p>
      <p><a href="${keys.BASE_SITE_URL}/auth/new-password/${token}">Restoring access</a></p>
      <hr/>
      <a href="${keys.BASE_SITE_URL}">Courses Shop</a>
    `
  }
}