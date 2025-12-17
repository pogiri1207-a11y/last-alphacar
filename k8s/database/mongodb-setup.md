# MongoDB 8.0 설정 완료

## 현재 상태

MongoDB 8.0 Deployment가 생성되었지만, Docker Hub의 rate limit으로 인해 이미지 pull이 실패하고 있습니다.

## 해결 방법

### 방법 1: Harbor 레지스트리에 MongoDB 8.0 이미지 미리 올리기 (권장)

```bash
# 마스터 노드에서 실행
docker pull mongo:8.0
docker tag mongo:8.0 192.168.0.169/alphacar-project/mongo:8.0
docker login 192.168.0.169 -u admin -p Harbor12345
docker push 192.168.0.169/alphacar-project/mongo:8.0
```

그 후 Deployment의 이미지를 변경:
```bash
kubectl set image deployment/mongodb mongodb=192.168.0.169/alphacar-project/mongo:8.0 -n alphacar
```

### 방법 2: 잠시 대기 후 재시도

Docker Hub rate limit은 시간이 지나면 해제됩니다. 잠시 후 자동으로 재시도됩니다.

```bash
# 상태 확인
kubectl get pods -n alphacar -l app=mongodb

# 수동으로 재시도하려면 Pod 삭제
kubectl delete pod -n alphacar -l app=mongodb
```

### 방법 3: 다른 노드에서 이미지 미리 pull

각 워커 노드에서 직접 이미지를 pull:
```bash
for node in node1 node2 node3; do
  ssh $node "sudo docker pull mongo:8.0"
done
```

## 배포된 리소스

- **Deployment**: `mongodb` (MongoDB 8.0)
- **Service**: `mongodb` (ClusterIP, 포트 27017)
- **PersistentVolume**: `mongodb-pv` (20Gi)
- **PersistentVolumeClaim**: `mongodb-pvc`

## 설정 정보

- **이미지**: `mongo:8.0`
- **호스트**: `mongodb.alphacar.svc.cluster.local` (또는 `mongodb`)
- **포트**: `27017`
- **사용자**: `admin`
- **비밀번호**: `123`
- **데이터베이스**: `alphacar`

## MongoDB Pod가 Running 상태가 된 후

데이터 복원:
```bash
cd /home/kevin/alphacar/k8s
./database/mongodb-restore.sh
```

## 상태 확인

```bash
# MongoDB Pod 상태
kubectl get pods -n alphacar -l app=mongodb

# MongoDB 서비스
kubectl get svc -n alphacar mongodb

# MongoDB 로그
kubectl logs -n alphacar -l app=mongodb -f

# MongoDB 연결 테스트
kubectl exec -it -n alphacar deployment/mongodb -- mongosh -u admin -p 123 --authenticationDatabase admin
```



