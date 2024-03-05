# Contributing

Hi there! We're thrilled that you'd like to contribute to this project. Your help is essential for keeping it great.

Contributions to this project are [released](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service#6-contributions-under-repository-license) to the public under the [project's open source license](./LICENSE).

Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Bootstrapping the Project

```shell
# Clone the repository
git clone https://github.com/travix/ts-grpc-hmac.git
npm install
```

## Running the Tests

```shell
npm fun test
```

## Local Development

it's recommended to adjust/modify the example to test the changes locally.

```shell
./example/run.sh
```

## Submitting Pull Requests

1. [Fork](https://github.com/travix/ts-grpc-hmac/fork) the repository and create your branch from `main`.
2. Configure and install the dependencies. `npm install`
3. Make sure the test pass on your machine. `npm run all`
4. Create a new branch: `git checkout -b my-branch-name`.
5. Make your change, add tests, and make sure the format and lint tests pass. `npm run lint && npm run format && npm run test`
6. Make sure to build the library. `npm run build` or I recommend using `npm run all` and you can pass the step 4.
7. Push to your fork and [submit a pull request](https://github.com/travix/ts-grpc-hmac/compare)
8. Pat yourself on the back and wait for your pull request to be reviewed and merged.
9. The maintainers will review your pull request and either merge it, request changes to it, or close it with an explanation.

## Resources
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [Using Pull Requests](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-requests)