const AWS = require('aws-sdk');
import { awsConfig } from '../../config/config';
import withSession from '../../lib/session'

const fetchUser = async (username, password) => {
  AWS.config.update(awsConfig);
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'users',
    KeyConditionExpression: 'username = :username and password = :password',
    ExpressionAttributeValues: {
      ':username': username,
      ':password': password,
    }
  };
  let response;
  try {
    response = await documentClient.query(params).promise();
  } catch(e) {
    throw new Error(`Could not fetch user '${username}'. An error occured when connecting to database.`);
  }

  return response;
}

const loginHandler = async (req, res) => {
  const { username, password } = req.body;
  let userData;
  try {
    userData = await fetchUser(username, password)
  } catch (e) {
    return res.status(500).json({
      error: e.message
    })
  }

  if (userData.Count && userData.Items && userData.Items[0] && userData.Items[0].username) {
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
  })
}

export default withSession(loginHandler);