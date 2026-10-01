

pipeline {
    agent any

   environment {
    IMAGE_NAME = 'cartforge'
    IMAGE_TAG = "${BUILD_NUMBER}"
    KUBECONFIG = 'C:/Users/saksh/.kube/config'
    MINIKUBE_HOME = 'C:/Users/saksh/.minikube'
}
    stages {

        stage('Environment Check') {
            steps {
                echo 'Checking Jenkins environment...'

                bat 'where node'
                bat 'node --version'
                bat 'where npm'
                bat 'npm --version'
                bat 'where docker'
                bat 'docker version'
            }
        }

        stage('Kubernetes Access Check') {
            steps {
                echo 'Checking Jenkins access to Minikube...'

                bat 'whoami'
                bat 'where kubectl'
                bat 'kubectl version --client'
                bat 'where minikube'
                bat 'minikube version'
                bat 'kubectl config current-context'
                bat 'kubectl get nodes'
            }
        }

        stage('Minikube Profile Check') {
            steps {
                echo 'Checking Minikube profile...'

                bat 'echo MINIKUBE_HOME=%MINIKUBE_HOME%'
                bat 'minikube status -p minikube'
                bat 'minikube profile list'
            }
        }

        stage('Checkout') {
            steps {
                echo 'Checking out CartForge source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing frontend dependencies...'
                bat 'npm ci'
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Building CartForge frontend...'
                bat 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                echo "Building ${IMAGE_NAME}:${IMAGE_TAG}..."
                bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Load Image into Minikube') {
            steps {
                echo 'Loading image into Minikube...'

                bat 'minikube image load %IMAGE_NAME%:%IMAGE_TAG% -p minikube'

                bat 'minikube image ls -p minikube | findstr /C:"docker.io/library/cartforge:%IMAGE_TAG%"'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Preparing Kubernetes manifest with the current build tag...'

                bat 'powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-Content -Raw kubernetes\\cartforge.yaml).Replace(\'cartforge:IMAGE_TAG\', \'cartforge:%IMAGE_TAG%\') | Set-Content kubernetes\\cartforge.yaml"'

                echo 'Applying the updated Kubernetes manifest...'

                bat 'kubectl apply -f kubernetes\\cartforge.yaml'

                bat 'kubectl rollout status deployment/cartforge --timeout=180s'
            }
        }

        stage('Kubernetes Verification') {
            steps {
                echo 'Verifying CartForge deployment...'

                bat 'kubectl get deployment cartforge'
                bat 'kubectl get pods -l app=cartforge -o wide'
                bat 'kubectl get service cartforge'
                bat 'kubectl get deployment cartforge -o jsonpath={.spec.template.spec.containers[0].image}'
            }
        }
    }

    post {
        success {
            echo 'CartForge CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'CartForge pipeline failed. Check the stage that failed.'
        }

        always {
            echo "Build number: ${BUILD_NUMBER}"
        }
    }
}