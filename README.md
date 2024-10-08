## Description

[Nest](https://github.com/nestjs/nest) Microservice framework auth service TypeScript repository.

## Installation

```bash
$ yarn
```

## Database

```bash

# generate schema after change or new schema
$ npx drizzle-kit generate --name "create_m_user_and_m_user_role"

# generate schema
$ yarn migrate

```

## Running the app

```bash
# development
$ yarn dev

# production mode
$ yarn start
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## License

Nest is [MIT licensed](LICENSE).
