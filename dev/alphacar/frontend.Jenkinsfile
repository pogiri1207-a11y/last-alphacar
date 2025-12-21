pipeline {
    agent any

    environment {
        HARBOR_URL = '192.168.0.169'
        HARBOR_PROJECT = 'giri'
        SERVICE_NAME = 'frontend'

        // Argo CD 매니페스트 저장소
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
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    def sonarPath = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    env.PATH = "${sonarPath}/bin:${env.PATH}"
                }
                // [수정] 프론트엔드 폴더로 이동하여 소나큐브 스캔
                dir('dev/alphacar/frontend') {
                    withSonarQubeEnv('sonarqube') {
                        sh "sonar-scanner -Dsonar.projectKey=alphacar-frontend -Dsonar.sources=. -Dsonar.host.url=http://sonarqube-service.jenkins.svc.cluster.local:9000"
                    }
                }
            }
        }

        stage('2. Build & Push Frontend Image') {
            steps {
                script {
                    echo "🔨 프론트엔드 빌드 시작 (경로: dev/alphacar/frontend)"
                    
                    // [핵심 수정] Dockerfile이 있는 실제 경로로 이동합니다.
                    dir('dev/alphacar/frontend') {
                        sh "docker build -t ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA} ."

                        withCredentials([usernamePassword(credentialsId: "${env.DOCKER_CREDENTIAL_ID}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                            sh "echo \$PASS | docker login ${HARBOR_URL} -u \$USER --password-stdin"
                            sh "docker push ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA}"
                        }
                    }
                }
            }
        }

        stage('3. Update Manifests (GitOps)') {
            steps {
                script {
                    echo "🚀 [GitOps] 프론트엔드 Manifest 업데이트"
                    dir('manifest-update') {
                        checkout([$class: 'GitSCM', 
                            branches: [[name: 'main']], 
                            extensions: [[$class: 'LocalBranch', localBranch: 'main']], 
                            userRemoteConfigs: [[url: "${env.MANIFEST_REPO_URL}", credentialsId: "${env.GIT_CREDENTIAL_ID}"]]
                        ])

                        // Argo CD 저장소 내 프론트엔드 YAML 경로 (보통 k8s/frontend/frontend.yaml)
                        def yamlPath = "k8s/frontend/${env.SERVICE_NAME}.yaml"
                        
                        sh """
                            if [ -f "${yamlPath}" ]; then
                                sed -i 's|image: ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:.*|image: ${HARBOR_URL}/${HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA}|' ${yamlPath}
                                
                                git config user.email "jenkins@alphacar.com"
                                git config user.name "Jenkins-CI"
                                git add .
                                if [ -n "\$(git status --porcelain)" ]; then
                                    git commit -m "Update frontend image to ${env.GIT_SHA} [skip ci]"
                                    git push origin main
                                else
                                    echo "✅ 변경사항 없음"
                                fi
                            else
                                echo "⚠️ 파일을 찾을 수 없습니다: ${yamlPath}"
                                # 파일이 없으면 에러를 내고 중단하려면 exit 1 추가
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
