pipeline {
    agent any

    environment {
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'giri'
        // 프론트엔드 서비스 이름 설정
        SERVICE_NAME = 'frontend'

        // Argo CD가 바라보는 매니페스트 저장소 (백엔드와 동일)
        MANIFEST_REPO_URL = 'https://github.com/pogiri1207-a11y/last-alphacar.git'
        
        GIT_CREDENTIAL_ID = 'github-cred'
        DOCKER_CREDENTIAL_ID = 'harbor-cred'
    }

    stages {
        stage('1. Prepare & SonarQube') {
            steps {
                cleanWs()
                checkout scm
                script {
                    // 이미지 태그용 Git Short Hash
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    
                    def sonarPath = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    env.PATH = "${sonarPath}/bin:${env.PATH}"
                }
                // 프론트엔드 소스 경로에 맞춰 dir() 수정 필요 (루트라면 제거 가능)
                withSonarQubeEnv('sonarqube') {
                    sh "sonar-scanner -Dsonar.projectKey=alphacar-frontend -Dsonar.sources=. -Dsonar.host.url=http://sonarqube-service.jenkins.svc.cluster.local:9000"
                }
            }
        }

        stage('2. Build & Push Frontend Image') {
            steps {
                script {
                    echo "🔨 프론트엔드 빌드 및 푸시 시작..."
                    // 프론트엔드 Dockerfile 위치 확인 필요 (보통 루트에 위치)
                    sh "docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA} ."

                    withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CREDENTIAL_ID}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                        sh "echo \$PASS | docker login ${HARBOR_URL} -u \$USER --password-stdin"
                        sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA}"
                    }
                }
            }
        }

        stage('3. Update Manifests (GitOps)') {
            steps {
                script {
                    echo "🚀 [GitOps] 프론트엔드 Manifest 업데이트 시작"
                    dir('manifest-update') {
                        checkout([$class: 'GitSCM', 
                            branches: [[name: 'main']], 
                            extensions: [[$class: 'LocalBranch', localBranch: 'main']], 
                            userRemoteConfigs: [[url: "${env.MANIFEST_REPO_URL}", credentialsId: "${env.GIT_CREDENTIAL_ID}"]]
                        ])

                        // 프론트엔드 YAML 파일 경로 확인 (k8s/frontend/frontend.yaml 가정)
                        def yamlPath = "k8s/frontend/${env.SERVICE_NAME}.yaml"
                        
                        sh """
                            if [ -f "${yamlPath}" ]; then
                                echo "📝 ${env.SERVICE_NAME} 이미지 태그 업데이트 중..."
                                sed -i 's|image: ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:.*|image: ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA}|' ${yamlPath}
                                
                                git config user.email "jenkins@alphacar.com"
                                git config user.name "Jenkins-CI"
                                git add .
                                if [ -n "\$(git status --porcelain)" ]; then
                                    git commit -m "Update frontend image to ${env.GIT_SHA} [skip ci]"
                                    git push origin main
                                else
                                    echo "✅ 변경사항이 없어 푸시를 생략합니다."
                                fi
                            else
                                echo "⚠️ 에러: ${yamlPath} 파일을 찾을 수 없습니다!"
                                exit 1
                            fi
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh "docker image prune -f"
            cleanWs()
        }
    }
}
