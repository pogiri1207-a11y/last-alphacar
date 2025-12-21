pipeline {
    agent any

    environment {
        SONARQUBE_ID = 'sonar-token'
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'giri'
        IMAGE_NAME = 'alphacar-frontend'
    }

    stages {
        stage('Initialize & Checkout') {
            steps {
                cleanWs() // 이전 빌드 찌꺼기 제거
                checkout scm // 깃허브에서 전체 소스 코드 가져오기
                script {
                    // 소나 스캐너 도구 경로 설정
                    def sonarPath = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    env.PATH = "${sonarPath}/bin:${env.PATH}"
                    
                    // 현재 커밋의 짧은 해시값(SHA) 추출
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                // 프론트엔드 소스 폴더로 이동하여 분석
                dir('dev/alphacar/frontend') {
                    withSonarQubeEnv('sonarqube') { 
                        sh """
                        sonar-scanner \
                        -Dsonar.projectKey=alphacar-frontend \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://sonarqube-service.jenkins.svc.cluster.local:9000
                        """
                    }
                }
            }
        }

        stage('Build & Trivy Scan') {
            steps {
                script {
                    def fullImageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                    
                    // dev/alphacar 폴더 안에서 빌드 컨텍스트 실행
                    dir('dev/alphacar') {
                        echo "🔨 프론트엔드 Docker 이미지 빌드 시작..."
                        // 프론트엔드 빌드는 메모리 소모가 크므로 BuildKit 사용 권장
                        sh "DOCKER_BUILDKIT=1 docker build -f frontend/Dockerfile -t ${fullImageName} frontend/"
                        
                        echo "🛡️ Trivy 보안 스캔 실행..."
                        // 보안 등급이 HIGH, CRITICAL인 항목 확인
                        sh "trivy image --severity HIGH,CRITICAL --no-progress ${fullImageName}"
                    }
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                // harbor-cred를 사용하여 로그인 및 푸시
                withCredentials([usernamePassword(credentialsId: 'harbor-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login ${HARBOR_URL} -u \$USER --password-stdin"
                    sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/${IMAGE_NAME}:${env.GIT_SHA}"
                    sh "docker logout ${HARBOR_URL}"
                }
            }
        }
    }

    post {
        success {
            echo "✅ 프론트엔드 빌드 및 Harbor 푸시 성공!"
        }
        failure {
            echo "❌ 빌드 실패! 로그를 확인하세요."
        }
    }
}
