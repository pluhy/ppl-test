const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
import { awsConfig } from '../../config/config';
import withSession from '../../lib/session'

const fetchUser = async (username) => {
  AWS.config.update(awsConfig);
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'users',
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: { ':username': username },
  };
  let response;
  try {
    response = await documentClient.query(params).promise();
  } catch(e) {
    throw new Error(`Could not fetch user '${username}'. An error occured when connecting to database.`);
  }

  return response;
}

const checkUser = async (passwordProvided, userFromDb) => {
  const isActive = !!userFromDb.active
  const passwordCheck = await bcrypt.compare(passwordProvided, userFromDb.password);
  return isActive && passwordCheck;
}

const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  let userData;
  try {
    userData = await fetchUser(username)
  } catch (e) {
    return res.status(500).json({
      error: e.message
    })
  }

  if (userData.Count === 1 && userData.Items && userData.Items[0]) {
    const userFromDb = userData.Items[0];
    if (!(await checkUser(password, userFromDb))) {
      return res.status(403).json({
        error: 'Authentication failed. Username or password invalid, or user not activated.'
      });
    }
    const user = {
      isLoggedIn: true,
      username: userData.Items[0].username,
    };
    req.session.set('user', user)
    await req.session.save()
    return res.status(200).json(user);
  }

  return res.status(403).json({
    error: 'Authentication failed. Username or password invalid.'
  });
}

export default withSession(loginHandler);