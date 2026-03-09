import * as cdk from "aws-cdk-lib"
import * as apprunner from "aws-cdk-lib/aws-apprunner"
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets"
import * as iam from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"
import * as path from "path"

export class GoatGameServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Build Docker image and push to ECR
    const imageAsset = new ecr_assets.DockerImageAsset(this, "GoatGameServerImage", {
      directory: path.join(__dirname, "../.."), // points to repo root where Dockerfile lives
    })

    // IAM role for App Runner to pull from ECR
    const accessRole = new iam.Role(this, "AppRunnerECRAccessRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    })
    imageAsset.repository.grantPull(accessRole)

    // IAM role for the App Runner instance (runtime)
    const instanceRole = new iam.Role(this, "AppRunnerInstanceRole", {
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    })

    // App Runner Service
    const service = new apprunner.CfnService(this, "GoatGameServerService", {
      serviceName: "goat-game-server",
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        imageRepository: {
          imageIdentifier: imageAsset.imageUri,
          imageRepositoryType: "ECR",
          imageConfiguration: {
            port: "3000",
            runtimeEnvironmentVariables: [
              { name: "NODE_ENV", value: "production" },
            ],
          },
        },
        autoDeploymentsEnabled: false,
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
