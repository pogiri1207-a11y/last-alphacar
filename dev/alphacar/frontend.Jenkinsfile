pipeline {
    agent any
    environment {
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'giri'
        IMAGE_NAME = 'alphacar-frontend'
    }
    stages {
        stage('Initialize & SonarQube') {
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

        stage('Docker Build') {
            steps {
                dir('dev/alphacar') {
                    script {
                        def fullImageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                        echo "🔨 프론트엔드 빌드 시작..."
                        // BuildKit 에러 방지를 위해 일반 빌드 사용
                        sh "docker build -f frontend/Dockerfile -t ${fullImageName} frontend/"
                    }
                }
            }
        }

        stage('Trivy Security Scan') {
            steps {
                script {
                    def fullImageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                    echo "🛡️ 보안 취약점 스캔 시작..."
                    // 스캔 시간을 줄이기 위해 이미 존재하는 DB 활용 시도 및 도커 실행
                    sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity HIGH,CRITICAL --no-progress ${fullImageName}"
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login ${HARBOR_URL} -u \$USER --password-stdin"
                    sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                    sh "docker logout ${HARBOR_URL}"
                }
            }
        }
    }
}
