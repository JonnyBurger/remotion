# @remotion/lambda

This package provides Node.JS APIs and a CLI for rendering Remotion videos on AWS Lambda. Currently the status of the package is highly experimental, but we are actively developing the library.

Visit the `#lambda` channel on Remotions Discord to chat about Lambda.

## Lambda restrictions

Note the following restrictions are put in place by AWS Lambda:

- Only 512 MB of data can be written to disk.
- A maximum of 3000 ([or 1000 or 500 dependending on the region](https://docs.aws.amazon.com/lambda/latest/dg/invocation-scaling.html)) lambdas can be spawned in a short amount of time.
