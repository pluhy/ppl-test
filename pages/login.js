import styled from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';
import useUser from '../lib/useUser';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router'
import Link from 'next/link'

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

const RegisterLink = styled.div`
  width: 92px;
  margin: auto;
`;

const LoginForm = () => {
  const { register, handleSubmit } = useForm();
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { mutateUser } = useUser({
    loginRoute: null ,
    lastRoute: router?.query?.lastRoute
  });

  const onSubmit = async (loginFormData) => {
    let user;
    try {
      user = await mutateUser(
        fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginFormData),
        })
      )
    } catch (error) {
      setErrorMessage('Během přihlášení došlo k chybě, zkuste to prosím znovu.')
    }
    
    if (!user.isLoggedIn) {
      setErrorMessage('Chybné uživatelské jméno nebo heslo, nebo nebyl uživatel aktivován.')
    }
  }

  return (
    <>
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
        <form>
            <div>
              <label htmlFor ="username"> Uživatelské jméno:</label>
              <StyledInputControl name="username" ref={register({ required: true })} />
            </div>
            <div>
              <label htmlFor ="password"> Heslo:</label>
              <StyledInputControl name="password" ref={register({ required: true })} />
            </div>
            <StyledSubmitButton onClick={handleSubmit(onSubmit)}>Přihlásit se</StyledSubmitButton>
        </form>
        <RegisterLink>
          <Link href="/register">
            <a>Registrovat se</a>
          </Link>
        </RegisterLink>
      </FormWrapper>

    </>
  )
}

export default LoginForm;
