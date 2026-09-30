
pipeline {
    agent any

    environment {
        IMAGE_NAME = 'cartforge'
        IMAGE_TAG  = "${BUILD_NUMBER}"
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
                bat 'kubectl get pods -o wide'
                bat 'kubectl get service cartforge'
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

        stage('CI Verification') {
            steps {
                echo 'CartForge CI pipeline completed successfully.'
                bat 'docker images %IMAGE_NAME%'
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
