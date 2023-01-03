# UPDATE: Cypress 10
While this course was being produced, Cypress 9 was the latest version. However, Cypress 10 has now been released, and it has some differences.

## If you'd like to use Cypress 9
Using Cypress 9 means that you will be able to follow along with the course code exactly. In order to do this, when you install Cypress you must use this command: 

npm install cypress@^9
This will install the latest version of Cypress 9.



## If you'd rather use Cypress 10
Cypress 10 is a major update, and requires different configuration syntax and filenames.

Course example using Cypress 10

You can find an example of course solutions using Cypress 10 (and Next.js 12.2) in the course repo.



## Some key differences:

Test files are located in the `e2e` directory instead of the `integration` directory

When opening Cypress, you need to `select e2e tests`.

Filenames end in `.cy.js` instead of `.test.js` (for example, if the course uses a file called routes.test.js, you will name this file routes.cy.js).

1. The file glob line in .eslintrc.json needs to account for this filename difference

2. Tasks and environment variables are written in `cypress.config.js` instead of `cypress/plugins/index.js`

The configuration file environment variable definition looks a bit different.

# WINDOWS USERS: Different `build: test` command required
## The issue
Your Cypress tests will not pass if you use the code presented in the following lecture on a Windows machine, as they will access **the wrong database** at run time.

## The fix
### Option #1: Use blitz CLI

Submitted by a student in this Q&A thread (thank you!).

Install the blitz package: npm install blitz

Change the build:test script in package.json to

`"build:test": "npm run db:reset && blitz build -e test"`,
Reference: this GitHub discussion comment.



### Option #2: Use dotenv-cli

Also submitted by a student in this Q&A thread (thanks!):

1. Add the package dotenv-cli: npm install dotenv-cli

2. Change the build:test script in package.json to

`"build:test": "npm run db:reset && dotenv -c test next build "`,


# TROUBLESHOOTING: `npm run cypress:run` hangs with 404 error
## The issue
npm run cypress:run results in the following error and no tests being run.

You have added a custom /_error page without a custom 404 page. This prevents the 404 page from being auto statically optimized.



## The fix
Update your scripts in package.json to: 

`"build:test": "npm run db:reset && blitz build -e test"`,
`"start:test": "blitz start -e test"`,
`"cypress:run": "start-server-and-test start:test http://0.0.0.0:3000 'env-cmd -f .env.test.local cypress run'"`
(note, you will need to run npm install blitz if you haven't already)

