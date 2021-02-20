const keys = require('../keys')

module.exports = function(email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Account created',
    html: `
      <h1>Welcome to our store "courses-shop"</h1>
      <p>You have successfully created an account with email - ${email}</p>
      <hr/>
      <a href="${keys.BASE_SITE_URL}">Courses shop</a>
    `
  }
}
