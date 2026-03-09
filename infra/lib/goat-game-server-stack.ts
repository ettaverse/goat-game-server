import * as cdk from "aws-cdk-lib"
import * as apprunner from "aws-cdk-lib/aws-apprunner"
import * as iam from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class GoatGameServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // IAM role for the App Runner instance (runtime)
    const instanceRole = new iam.Role(this, "AppRunnerInstanceRole", {
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    })

    // App Runner Service — uses GitHub connection for source code
    // The connection must be created manually in the AWS Console first:
    // App Runner > GitHub connections > Create new connection
    const githubConnectionArn = new cdk.CfnParameter(this, "GitHubConnectionArn", {
      type: "String",
      description: "ARN of the App Runner GitHub connection (create in AWS Console > App Runner > GitHub connections)",
    })

    const service = new apprunner.CfnService(this, "GoatGameServerService", {
      serviceName: "goat-game-server",
      sourceConfiguration: {
        authenticationConfiguration: {
          connectionArn: githubConnectionArn.valueAsString,
        },
        codeRepository: {
          repositoryUrl: "https://github.com/ettaverse/goat-game-server",
          sourceCodeVersion: {
            type: "BRANCH",
            value: "main",
          },
          codeConfiguration: {
            configurationSource: "API",
            codeConfigurationValues: {
              runtime: "NODEJS_18",
              buildCommand: "npm ci && npm run build",
              startCommand: "npm start",
              port: "3000",
              runtimeEnvironmentVariables: [
                { name: "NODE_ENV", value: "production" },
              ],
            },
          },
        },
        autoDeploymentsEnabled: true,
      },
      instanceConfiguration: {
        cpu: "0.25 vCPU",
        memory: "0.5 GB",
        instanceRoleArn: instanceRole.roleArn,
      },
      healthCheckConfiguration: {
        protocol: "HTTP",
        path: "/health",
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
    })

    // Outputs
    new cdk.CfnOutput(this, "ServiceUrl", {
      value: `https://${service.attrServiceUrl}`,
      description: "App Runner Service URL",
    })

    new cdk.CfnOutput(this, "ServiceArn", {
      value: service.attrServiceArn,
      description: "App Runner Service ARN",
    })
  }
}
