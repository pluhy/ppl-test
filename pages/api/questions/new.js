const AWS = require('aws-sdk');
import { awsConfig } from '../../../config/config';

const putQuestion = async (req, res) => {
  const item = req.body;
  AWS.config.update(awsConfig);
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'questions',
    Item: item,
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
    message: 'Successfully added question.',
  });
}

export default putQuestion;