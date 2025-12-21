pipeline {
    agent any
    environment {
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'giri'
        IMAGE_NAME = 'alphacar-frontend'
    }
    stages {
        stage('1. Initialize & SonarQube') {
            steps {
                cleanWs()
                checkout scm
                script {
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    def sonarPath = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    env.PATH = "${sonarPath}/bin:${env.PATH}"
                }
                dir('dev/alphacar/frontend') {
                    withSonarQubeEnv('sonarqube') { 
                        sh "sonar-scanner -Dsonar.projectKey=alphacar-frontend -Dsonar.sources=. -Dsonar.host.url=http://sonarqube-service.jenkins.svc.cluster.local:9000"
                    }
                }
            }
        }

        stage('2. Trivy Source Scan') {
            steps {
                echo "🛡️ 프론트엔드 소스 코드 보안 스캔 중..."
                sh """
                    mkdir -p /tmp/trivy-cache
                    docker run --rm -v /tmp/trivy-cache:/root/.cache/trivy -v \$(pwd):/src \
                    aquasec/trivy fs --severity HIGH,CRITICAL --no-progress --scanners vuln /src/dev/alphacar/frontend
                """
            }
        }

        stage('3. Docker Build') {
            steps {
                dir('dev/alphacar') {
                    sh "docker build -f frontend/Dockerfile -t ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA} frontend/"
                }
            }
        }

        stage('4. Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login ${HARBOR_URL} -u \$USER --password-stdin"
                    sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                }
            }
        }
    }
}
