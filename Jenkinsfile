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

        // keep the remaining stages exactly as they are