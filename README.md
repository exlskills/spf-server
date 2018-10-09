[![Docker Automated build](https://img.shields.io/docker/automated/jrottenberg/ffmpeg.svg)](https://hub.docker.com/r/exlskills/spf-server/)

# EXLskills SPF Web Server

## Requirements

You may be able to get away with more/less than what's described below, but we can't recommend anything outside of these options:

Operating Systems:

- Ubuntu 16.04
- OS X 10.13+
- Windows has not been thoroughly tested, although it has worked and should work... Windows-related contributions are welcome

Other Dependencies:

- NodeJS v8.10+
- NPM v6.1+

## Installation

```
git clone https://github.com/exlskills/spf-server

cd spf-server

npm install
```

## Environment

Setup environment variables by first copying the environment variable config template:

```
cp .envdefault .env
```

Replace default environment variables with your own (key=value). See more [here](https://github.com/motdotla/dotenv)

## Running

To compile and run the server, run:

```
npm start
```

## GraphQL Schema

The `schema.graphql` file comes from the [GraphQL server](https://github.com/exlskills/gql-server), and it is periodically copied into this repository.

In the event that you require the latest `schema.graphql` or you would like to test some latest changes in the GraphQL server, follow the steps prescribed below:

The snippet below assumes that you have installed the [GraphQL server](https://github.com/exlskills/gql-server) into `../gql-server`:

```
cd ../gql-server

npm run update-schema

cp src/schema.graphql ../spf-server

cd ../spf-server
```

## License

This software is offered under the terms outlined in the [LICENSE.md](LICENSE.md) file provided with this notice. If you have any questions regarding the license, please contact [licensing@exlinc.com](mailto:licensing@exlinc.com)

## Enterprise / Commercial Licensing & Support

For enterprise licenses and/or support, please send an email enquiry to [enterprise@exlinc.com](mailto:enterprise@exlinc.com)