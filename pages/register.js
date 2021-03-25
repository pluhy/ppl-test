import styled from 'styled-components';
import { FaExclamationCircle, FaRegCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

const FormWrapper = styled.div`
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
  width: 50%;
  margin: auto;
`;

const StyledInputControl = styled.input`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const StyledSubmitButton = styled.button`
  width: 100%;
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

const ErrorMessageWrapper = styled.span`
  color: red;
`;

const SuccessMessageWrapper = styled.span`
  color: green;
`;

const LoginForm = () => {
  const { register, handleSubmit } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (registerFormData) => {
    setSuccessMessage('');
    setErrorMessage('');
    let response;
    try {
      response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerFormData),
      })
    } catch (error) {
      setErrorMessage('Registrace se nezdařila, zkuste to prosím znovu.');
      return;
    }
    if (response.ok) {
      setSuccessMessage('Registrace proběhla v pořádku. Nyní musíte vyčkat na aktivaci účtu administrátorem.');
      return;
    }
    setErrorMessage('Registrace se nezdařila, zkuste to prosím znovu.')
    return;
  }

  return (
    <FormWrapper>
      {errorMessage && (
        <p>
          <ErrorMessageWrapper>
            <FaExclamationCircle />
            &nbsp;
            {errorMessage}
          </ErrorMessageWrapper>
        </p>
      )}
      {successMessage && (
        <p>
          <SuccessMessageWrapper>
            <FaRegCheckCircle />
            &nbsp;
            {successMessage}
          </SuccessMessageWrapper>
        </p>
      )}
      <form>
          <div>
            <label htmlFor ="username"> Uživatelské jméno:</label>
            <StyledInputControl name="username" ref={register({ required: true })} />
          </div>
          <div>
            <label htmlFor ="password"> Heslo:</label>
            <StyledInputControl name="password" ref={register({ required: true })} />
          </div>
          <StyledSubmitButton onClick={handleSubmit(onSubmit)}>Registrovat se</StyledSubmitButton>
      </form>
    </FormWrapper>
  )
}

export default LoginForm;
