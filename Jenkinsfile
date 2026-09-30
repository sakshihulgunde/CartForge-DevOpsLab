pipeline {
    agent any

    environment {
        IMAGE_NAME = 'cartforge'
        IMAGE_TAG  = "${BUILD_NUMBER}"
        KUBECONFIG = 'C:/ProgramData/Jenkins/.kube/config'
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
                echo 'Building CartForge Docker image...'
                bat 'docker build -t %IMAGE_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Load Image into Minikube') {
            steps {
                echo 'Loading CartForge Docker image into Minikube...'
                bat 'minikube image load %IMAGE_NAME%:%IMAGE_TAG%'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying CartForge to Kubernetes...'
                bat 'kubectl apply -f kubernetes\\cartforge.yaml'
                bat 'kubectl set image deployment/cartforge cartforge=%IMAGE_NAME%:%IMAGE_TAG%'
                bat 'kubectl rollout status deployment/cartforge --timeout=180s'
            }
        }

        stage('Kubernetes Verification') {
            steps {
                echo 'Verifying CartForge Kubernetes deployment...'
                bat 'kubectl get deployment cartforge'
                bat 'kubectl get pods -o wide'
                bat 'kubectl get service cartforge'
            }
        }
    }

    post {
        success {
            echo 'CartForge CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'CartForge pipeline failed. Check the Jenkins console output.'
        }

        always {
            echo "Build number: ${BUILD_NUMBER}"
        }
    }
}