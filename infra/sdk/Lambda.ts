// TODO: abstract Lambda into this construct

// import { Construct } from 'constructs'
// import * as lambda from 'aws-cdk-lib/aws-lambda'

// export interface MyLambdaConstructProps {
//   // Define any props you want to pass to the Lambda function
//   scope: Construct
//   code: lambda.Code
//   // Add more props as needed
// }

// export class LambdaConstruct extends Construct {
//   constructor (scope: Construct, id: string, props: MyLambdaConstructProps) {
//     super(scope, id)

//     const { ...lambdaProps } = props

//     const lambdaFunction = new lambda.Function(this, 'MyLambdaFunction', {
//       runtime: lambda.Runtime.NODEJS_18_X,
//       handler: 'index.handler',
//       ...lambdaProps
//     })
//   }
// }
