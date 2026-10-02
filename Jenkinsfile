

pipeline {
agent any

environment {
    KUBECTL = 'C:\\Users\\saksh\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
    KUBECONFIG = 'C:\\Users\\saksh\\.kube\\config'
    IMAGE_NAME = 'cartforge'
    IMAGE_TAG = "${BUILD_NUMBER}"
}

stages {

    stage('Checkout') {
        steps {
            echo 'Checking out CartForge source code...'
            checkout scm
        }
    }

    stage('Build React Application') {
        steps {
            echo 'Building CartForge frontend...'
            bat 'npm ci'
            bat 'npm run build'
        }
    }

    stage('Check Docker') {
        steps {
            echo 'Checking Docker...'
            bat 'docker version'
        }
    }

    stage('Build Docker Image') {
        steps {
            echo "Building Docker image ${IMAGE_NAME}:${IMAGE_TAG}..."

            bat "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            bat "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
        }
    }

    stage('Check Kubernetes') {
        steps {
            echo 'Checking Kubernetes connection...'

            bat """
            set KUBECONFIG=${KUBECONFIG}
            "${KUBECTL}" config current-context
            "${KUBECTL}" get nodes
            """
        }
    }

    stage('Load Image into Minikube') {
        steps {
            echo "Loading ${IMAGE_NAME}:${IMAGE_TAG} into Minikube..."

            bat """
            minikube image load ${IMAGE_NAME}:${IMAGE_TAG}
            """
        }
    }

    stage('Deploy to Kubernetes') {
        steps {
            echo 'Deploying CartForge to Kubernetes...'

            bat """
            powershell -Command "(Get-Content kubernetes/cartforge.yaml) -replace 'cartforge:IMAGE_TAG', 'cartforge:${IMAGE_TAG}' | Set-Content kubernetes/cartforge-deploy.yaml"

            set KUBECONFIG=${KUBECONFIG}

            "${KUBECTL}" apply -f kubernetes/cartforge-deploy.yaml
            """
        }
    }

    stage('Wait for Deployment') {
        steps {
            echo 'Waiting for CartForge deployment...'

            bat """
            set KUBECONFIG=${KUBECONFIG}

            "${KUBECTL}" rollout status deployment/cartforge --timeout=120s
            """
        }
    }

    stage('Verify Kubernetes') {
        steps {
            echo 'Verifying CartForge Kubernetes resources...'

            bat """
            set KUBECONFIG=${KUBECONFIG}

            "${KUBECTL}" get deployments
            "${KUBECTL}" get pods -o wide
            "${KUBECTL}" get services
            """
        }
    }

}

post {
    success {
        echo '=========================================='
        echo 'CartForge CI/CD Pipeline SUCCESS'
        echo 'Docker image built successfully'
        echo 'Image loaded into Minikube'
        echo 'CartForge deployed to Kubernetes'
        echo 'Deployment rollout successful'
        echo '=========================================='
    }

    failure {
        echo '=========================================='
        echo 'CartForge CI/CD Pipeline FAILED'
        echo 'Check the stage above for the error.'
        echo '=========================================='
    }
}


}
