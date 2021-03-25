const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
import { awsConfig } from '../../config/config';

const registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    const passwordHash = await bcrypt.hash(password, 10)
    const item = {
      username: username,
      password: passwordHash,
      active: 0,
    };
    AWS.config.update(awsConfig);
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
      TableName: 'users',
      Item: item,
      ConditionExpression: 'attribute_not_exists(username)',
    };
  
    let response;
    try {
      response = await documentClient.put(params).promise();
    } catch(e) {
      res.status(500).json({
        success: false,
        message: e.message
      });
      return;
    }
  
    res.status(200).json({
      success: true,
      message: 'Successfully registered user.',
    });  
  }

};

export default registerUser;