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
                    // 이미지 태그용 Git SHA 추출
                    env.GIT_SHA = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    def sonarPath = tool name: 'sonar-scanner', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    env.PATH = "${sonarPath}/bin:${env.PATH}"
                }
                // 프론트엔드 폴더로 이동하여 소나큐브 스캔
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

                    // Dockerfile이 있는 실제 경로로 이동하여 빌드 및 푸시
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
                    echo "🚀 [GitOps] 프론트엔드 Manifest 업데이트 시작"
                    dir('manifest-update') {
                        // 저장소 클론 (main 브랜치 명시 및 Detached HEAD 방지)
                        checkout([$class: 'GitSCM',
                            branches: [[name: 'main']],
                            extensions: [[$class: 'LocalBranch', localBranch: 'main']],
                            userRemoteConfigs: [[url: "${env.MANIFEST_REPO_URL}", credentialsId: "${env.GIT_CREDENTIAL_ID}"]]
                        ])

                        // Argo CD 저장소 내 프론트엔드 YAML 경로
                        def yamlPath = "k8s/frontend/${env.SERVICE_NAME}-deployment.yaml"

                        sh """
                            if [ -f "${yamlPath}" ]; then
                                echo "📝 [자동화] 기존 경로가 무엇이든 ${env.HARBOR_PROJECT} 프로젝트와 새 태그(${env.GIT_SHA})로 강제 업데이트합니다."
                                
                                # [핵심 수정] 정규표현식을 사용하여 중간 경로(kdh 등)를 무시하고 무조건 giri로 교체합니다.
                                sed -i 's|image: ${env.HARBOR_URL}/[^/]*/alphacar-${env.SERVICE_NAME}:.*|image: ${env.HARBOR_URL}/${env.HARBOR_PROJECT}/alphacar-${env.SERVICE_NAME}:${env.GIT_SHA}|' ${yamlPath}

                                git config user.email "jenkins@alphacar.com"
                                git config user.name "Jenkins-CI"
                                git add .
                                
                                # 변경사항이 있을 때만 커밋 및 푸시
                                if [ -n "\$(git status --porcelain)" ]; then
                                    git commit -m "Update frontend image to ${env.HARBOR_PROJECT}:${env.GIT_SHA} [skip ci]"
                                    git push origin main
                                    echo "✅ 깃허브 매니페스트 업데이트 성공!"
                                else
                                    echo "✅ 변경사항 없음 (이미 최신 이미지 주소입니다)"
                                fi
                            else
                                echo "⚠️ 파일을 찾을 수 없습니다: ${yamlPath}"
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
