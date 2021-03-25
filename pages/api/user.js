import withSession from "../../lib/session"

const userHandler = async (req, res) => {
  const user = req.session.get('user')

  if (user) {
    return res.json(user)
  }

  return res.json({
    isLoggedIn: false
  })
}

export default withSession(userHandler);