pipeline {
    agent any

    environment {
        IMAGE_NAME = 'cartforge'
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    stages {

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
