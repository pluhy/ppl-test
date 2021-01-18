import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { FaRegCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const StyledInputControl = styled.input`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const StyledAnswerInputControl = styled.input`
  width: 90%;
  padding: 12px 20px;
  margin: 8px 8px;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const AddAnswerButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 0 auto;
  display: block;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const RemoveAnswerButton = styled.button`
  background-color: #dc3545;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #c82333;
  }
`;

const StyledSelectControl = styled.select`
  padding: 12px 20px;
  margin: 8px 0;
  display: block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const SubmitButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 0 auto;
  display: block;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

const ErrorMessageWrapper = styled.span`
  color: red;
`;

const SuccessMessageWrapper = styled.span`
  color: green;
`;

const NewQeustionForm = () => {
  const { register, handleSubmit, errors, reset } = useForm();
  const [ answersIndexes, setAnswersIndexes ] = useState([0, 1, 2, 3]);
  const [ answersNumbers, setAnswersNumbers ] = useState({
    0: 0,
    1: 1,
    2: 2,
    3: 3,
  });
  const [requestSuccessMessage, setRequestSuccessMessage] = useState('');
  const [requestErrorMessage, setRequestErrorMessage] = useState('');

  const onSubmit = async (questionData) => {
    setRequestErrorMessage('');
    const answers = questionData.answers.filter(answer => answer !== null);
    const transformedQuestionData = {
      categoryId: parseInt(questionData.category_id, 10),
      questionId: parseInt(questionData.question_id, 10),
      questionText: questionData.question_text,
      correctAnswerIndex: parseInt(questionData.correct_answer, 10),
      answers: answers,
    }

    let response;
    try {
      response = await fetch('/api/questions/new', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedQuestionData)
      });
    } catch(e) {
      setErrorMessage();
    }
    if (response.status === 200) {
      setSuccessMessage();
    } else {
      setErrorMessage();
    }
  };

  const setSuccessMessage = () => {
    setRequestSuccessMessage('Otázka byla úspěšně uložena.');
    setTimeout(() => {
      setRequestSuccessMessage('');
      reset();
    }, 2000);
  }

  const setErrorMessage = () => {
    setRequestErrorMessage('Nezdařilo se uložit otázku. Zkuste to prosím znovu.');
  }

  // Example - question removed:
  // answersIndexes = [0, 1, 2, 3]
  // answersNumbers = {0: 0, 1: 1, 2: 2, 3: 3}
  // -> updatedAnswersIndexes = [0, null, 2, 3]
  // -> updatedAnswersNumbers = {0: 0, 2: 1, 3: 2}
  const updateAnswersNumbers = (updatedAnswersIndexes) => {
    const updatedAnswersNumbers = updatedAnswersIndexes.reduce((acc, index) => {
      if (index !== null) {
        acc[index] = Object.keys(acc).length;
      }
      return acc;
    }, {});
    setAnswersNumbers(updatedAnswersNumbers)
  }

  const addAnswer = () => {
    const lastIndex = answersIndexes[answersIndexes.length - 1];
    const updatedAnswersIndexes = [...answersIndexes, lastIndex + 1];
    setAnswersIndexes(updatedAnswersIndexes);
    updateAnswersNumbers(updatedAnswersIndexes);
  }

  const removeAnswer = (indexToRemove) => {
    const updatedAnswersIndexes =  answersIndexes.map(answerIndex => answerIndex === indexToRemove ? null : answerIndex);
    setAnswersIndexes(updatedAnswersIndexes);
    updateAnswersNumbers(updatedAnswersIndexes);
  }

  const getAnswerLetter = (answerNumber) => {
    return String.fromCharCode('a'.charCodeAt(0) + answerNumber);
  };

  return (
    <>
      <h1>Zadat novou otázku</h1>
      {requestErrorMessage && (
        <p>
          <ErrorMessageWrapper>
            <FaExclamationCircle />
            &nbsp;
            {requestErrorMessage}
          </ErrorMessageWrapper>
        </p>
      )}
      {requestSuccessMessage && (
        <p>
          <SuccessMessageWrapper>
            <FaRegCheckCircle />
            &nbsp;
            {requestSuccessMessage}
          </SuccessMessageWrapper>
        </p>
      )}
      <form>
        <div>
          <label htmlFor ="category_id"> Okruh číslo:</label>
          <StyledInputControl type="number" name="category_id" ref={register({ required: true })} />
        </div>
        <div>
          <label htmlFor ="question_id"> Otázka číslo:</label>
          <StyledInputControl type="number" name="question_id" ref={register({ required: true })} />
        </div>
        <div>
          <label htmlFor ="question_id"> Text otázky:</label>
          <StyledTextarea name="question_text" ref={register({ required: true })}></StyledTextarea>
        </div>
        <h3>Odpovědi</h3>
          <AddAnswerButton type="button" onClick={addAnswer}>
            Přidat odpověď
          </AddAnswerButton>
          {answersIndexes.map(answerIndex => {
            if (answerIndex !== null) {
              return (
                <div key={answerIndex}>
                  {`${getAnswerLetter(answersNumbers[answerIndex])}) `}
                  <StyledAnswerInputControl type="text" name={`answers[${answerIndex}]`} ref={register({ required: true })} />
                  <RemoveAnswerButton type="button" onClick={() => removeAnswer(answerIndex)}>Odstranit</RemoveAnswerButton>
                </div>
              )
            }
          })}
          <label>Správná odpověd:</label>
          <StyledSelectControl name="correct_answer" ref={register({ required: true })}>
            {answersIndexes.map(answerIndex => {
              if (answerIndex !== null) {
                return (
                  <option key={answerIndex} value={answersNumbers[answerIndex]}>{getAnswerLetter(answersNumbers[answerIndex])}</option>
                );
              }
            })}
          </StyledSelectControl>
        <SubmitButton onClick={handleSubmit(onSubmit)}>Uložit</SubmitButton>
      </form>
    </>
  )
};

export default NewQeustionForm;