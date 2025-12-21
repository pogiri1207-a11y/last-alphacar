pipeline {
    agent any
    environment {
        SONARQUBE_ID = 'sonar-token'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'giri'
        IMAGE_NAME = 'alphacar-frontend'
    }
    stages {
        stage('Initialize') {
            steps {
                cleanWs()
                script {
                    def sonarPath = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    env.PATH = "${sonarPath}/bin:${env.PATH}"
                    checkout scm
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                dir('dev/alphacar/frontend') {
                    withSonarQubeEnv('sonarqube') { 
                        // 프론트엔드 소스만 집중 분석
                        sh "sonar-scanner -Dsonar.projectKey=alphacar-frontend -Dsonar.sources=. -Dsonar.host.url=http://sonarqube-service.jenkins.svc.cluster.local:9000"
                    }
                }
            }
        }

        stage('Build & Trivy Scan') {
            steps {
                dir('dev/alphacar') {
                    script {
                        def fullImageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                        
                        echo "🔨 프론트엔드 빌드 시작..."
                        sh "docker build -f frontend/Dockerfile -t ${fullImageName} frontend/"
                        
                        echo "🛡️ Trivy 보안 스캔 중..."
                        // Trivy가 설치되어 있어야 작동합니다. 없으면 아래 줄을 주석 처리하세요.
                        sh "trivy image --severity HIGH,CRITICAL --no-progress ${fullImageName}"
                    }
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login ${HARBOR_URL} -u \$USER --password-stdin"
                    sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                }
            }
        }
    }
}
