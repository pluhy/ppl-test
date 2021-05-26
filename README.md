## ppl-test

This is a simple quizz application. With current deployment it is used together with database containing CAA (Civil Aviation Authority) questions for PPL/LAPL exams. Questions and answers are available in czech language only.

This application has been created for personal purposes, when preparing for the PPL exam. It has only limited functionality and design. I am sharing it "as is". Feel free to fork it or submit a PR, if you would like to fix or improve anything.

It can be easily used for any other questions/answers. For details see the "For developers" section.

### For users
Application is currently available here https://ppl-test.vercel.app/

There is no guarantee, the questions and answers are correct and up-to-date. Questions have been copied manually from the PDF files provided by CAA (https://www.caa.cz/zkusebni-otazky-pro-zkousky-teoretickych-znalosti-ppl-lapl/).

### For developers
This web application is based on Next.js. It is connected to AWS DynamoDB, holding the users and questions data:

#### users:
- username (string)
- active (number 1|0)
- password (string)

#### questions:
- answers (array of strings)
- categoryId (number - partition key)
- correctAnswerIndex (number)
- questionId (number - sort key)
- questionText (string)

If you want to use this app for different purposes, you can create your own tables in AWS. AWS config is taken from following environment variables:
- PPL_TEST_AWS_REGION
- PPL_TEST_AWS_ACCESS_KEY_ID
- PPL_TEST_AWS_SECRET_ACCESS_KEY

They are read in `config/config.js`, so you can change the environment variables names there, if needed.

Currently, there is automatic deployment to Vercel set up. Environment variables are defined there, so that database with the CAA questions is used.

#### Users management
There is a possibility to restrict some pages only for authorized users. Currently only the UI for creating new questions (`/questions/new`) is restricted. There is a very basic registration form (`/register`), which creates a new user in the `users` table in AWS DynamoDB and sets the `active` flag to `0`. Administrator must set it to `1` manually, so that user is able to log in.
