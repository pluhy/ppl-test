const AWS = require('aws-sdk');
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useState, useEffect  } from 'react'
import { FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link'
import Image from 'next/image'
import { categories, awsConfig } from '../../config/config';

const ErrorMessageWrapper = styled.span`
  color: red;
`;

const ActionButton = styled.button`
  background-color: #007bff;
  color: #fff;
  padding: 14px 20px;
  margin: 0 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #0069d9;
  }
`;

const ResultWrapper = styled.div`
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: bold;
`;

const ResultText = styled.span`
  color: ${props => props.ok ? 'green' : 'red'}
`;

const QuestionText = styled.div`
  font-weight: bold;
`;

const AnswerLabel = styled.label`
  ${({ isAnswerSelected, isQuestionAnsweredCorrectly, highlightCorrectAnswer}) => {
    if(isAnswerSelected) {
      if (isQuestionAnsweredCorrectly) {
        return 'color: green';
      }
      return 'color: red';
    } else if (highlightCorrectAnswer) {
      return 'background-color: green';
    }
  }}
`;

const SubmitButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const fetchQuestions = async (categoryId) => {
  AWS.config.update(awsConfig);
  const documentClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'questions',
    KeyConditionExpression: 'categoryId = :categoryId',
    ExpressionAttributeValues: {
      ':categoryId': categoryId,
    }
  };
  let response;
  try {
    response = await documentClient.query(params).promise();
  } catch(e) {
    throw new Error(`Could not fetch questions for category ID '${categoryId}'`);
  }

  return response;
}

export const getServerSideProps = async (context) => {
  const categoryId = parseInt(context.query.id, 10);
  let questions = [];
  let errorMessage = '';

  if (isNaN(categoryId) || !categories[categoryId]) {
    errorMessage = 'Nebylo zadáno číslo okruhu, nebo zadané číslo okruhu neexistuje';
    return {
      props: { categoryId, questions, errorMessage }
    }; 
  }

  let questionsResponse;
  try{
    questionsResponse = await fetchQuestions(categoryId);
  } catch (e) {
    errorMessage = 'Nepodařilo se načíst otázky. Zkuste to prosím znovu.';
    return {
      props: { categoryId, questions, errorMessage }
    }; 
  }
  questions = questionsResponse && questionsResponse.Items;

  return {
    props: { categoryId, questions, errorMessage }
  };
}

const CategoryQuestions = ({ categoryId, questions, errorMessage }) => {
  const NUMBER_OF_QUESTIONS = 12;
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [answersScoring, setAnswersScoring] = useState(null);
  const { register, handleSubmit, errors, reset } = useForm();
  
  
  useEffect(() => {
    reloadQuestions();
  }, []);

  const getRandomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const getRandomQuestions = (allQuestions, numberOfQuestions) => {
    let questionsWithoutSelected = allQuestions;
    const selectedQuestions = [];
    for (let i = 0; i < numberOfQuestions; i++) {
      const randomQuestionIndex = getRandomInt(questionsWithoutSelected.length);
      selectedQuestions.push(questionsWithoutSelected[randomQuestionIndex]);
      questionsWithoutSelected = questionsWithoutSelected.filter((question, i) => i !== randomQuestionIndex);
    }

    return selectedQuestions;
  }

  const reloadQuestions = () => {
    const numberOfQuestions = questions.length > NUMBER_OF_QUESTIONS ? NUMBER_OF_QUESTIONS : questions.length;
    const newQuestions = getRandomQuestions(questions, numberOfQuestions);
    setCurrentQuestions(newQuestions);
    setAnswersScoring(null);
    reset();
  };

  const evaluateAnswers = (answers) => {
    const scoring = currentQuestions.reduce((acc, question) => {
      const correctAnswer = question.correctAnswerIndex;
      const actualAnswer = parseInt(answers.answers[question.questionId], 10);
      const isCorrect = correctAnswer === actualAnswer;
      acc[question.questionId] = {correctAnswer, actualAnswer, isCorrect};
      if (isCorrect) {
        acc.correctTotal = acc.correctTotal + 1;
      }
      return acc;
    }, {correctTotal: 0});
    setAnswersScoring(scoring);
  };

  const title = (<h1>{`Otázky ${categories[categoryId] ? `"${categories[categoryId]}"` : ''}`}</h1>);
  const scoringPercentage = answersScoring && Math.round(answersScoring.correctTotal / currentQuestions.length * 100);
  const scoringPassed = answersScoring && (answersScoring.correctTotal / currentQuestions.length * 100) > 75;

  if (errorMessage) {
    return (
      <>
        {title}
        <p>
            <ErrorMessageWrapper>
              <FaExclamationCircle />
              &nbsp;
              {errorMessage}
            </ErrorMessageWrapper>
          </p>
        </>
    )
  }
  
  return (
    <>
      {title}

      {answersScoring && (
        <ResultWrapper>
          <span>Tvůj výsledek:&nbsp;</span>
          <ResultText ok={scoringPassed}>
            {`Správně zodpovězeno: ${answersScoring.correctTotal} z ${currentQuestions.length} (${scoringPercentage} %)`}
          </ResultText>
        </ResultWrapper>
      )}

      <ActionButton type="button" onClick={reloadQuestions}>Nové otázky</ActionButton>
      <Link href="/">
        <ActionButton>Zpět na seznam okruhů</ActionButton>
      </Link>

      <form>
        {currentQuestions.map((question, i) => (
          <div key={question.questionId}>
            <QuestionText>{`${i + 1}) ${question.questionText}`}</QuestionText>
            {question.imageName &&
              <Image src={`/${question.imageName}.jpg`} width="128" height="128" />
            }
            {errors.answers && errors.answers[question.questionId] &&
              <ErrorMessageWrapper>Zodpovězte prosím tuto otázku</ErrorMessageWrapper>
            }
            <ul>
              {question.answers.map((answer, index) => (
                <li key={index}>
                  <AnswerLabel 
                    isAnswerSelected={answersScoring && answersScoring[question.questionId].actualAnswer === index}
                    isQuestionAnsweredCorrectly={answersScoring && answersScoring[question.questionId].isCorrect} 
                    highlightCorrectAnswer={answersScoring && !answersScoring[question.questionId].isCorrect && answersScoring[question.questionId].correctAnswer === index}
                  >
                    <input 
                      type="radio" 
                      name={`answers[${question.questionId}]`} 
                      value={index}
                      ref={register({ required: true })}
                    />
                    {answer}
                  </AnswerLabel>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <SubmitButton onClick={handleSubmit(evaluateAnswers)}>Odeslat</SubmitButton>
      </form>
    </>
  )
}

export default CategoryQuestions;