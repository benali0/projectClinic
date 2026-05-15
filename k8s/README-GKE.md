# Déploiement GKE (1 URL, sans domaine)

Objectif: déployer sur GKE (GCP) avec MySQL dans le cluster et obtenir **un seul URL public** basé sur l'IP publique du Ingress:

- URL jury: `http://<IP_INGRESS>/`
- Front: `/`
- API: `/clinique/api/...`

## Prérequis

- `gcloud`, `kubectl`, `docker` installés.
- PowerShell: si `gcloud` échoue avec *ExecutionPolicy*, exécuter (au choix):
  - `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
  - ou temporaire: `Set-ExecutionPolicy -Scope Process Bypass`

## IMPORTANT (frontend)

Tant que le front garde `localhost` dans `api.config.ts`, le jury ne pourra pas utiliser l'app en public.
Le minimum est de passer à **`baseUrl: '/clinique/api'`** puis rebuild l'image frontend.

Le changement est déjà fait dans:
- `clinique_frontend/src/app/config/api.config.ts`

## Variables à remplir

- `PROJECT_ID=cliniqueproject`
- `REGION=europe-west1`
- `CLUSTER_NAME` (ex: `clinique-gke`)
- `REPO=repoclinic` (Artifact Registry, doit être en minuscules)

## 1) Login + projet

```powershell
$PROJECT_ID="cliniqueproject"
$REGION="europe-west1"
$ZONE="europe-west1-b"
$CLUSTER_NAME="clinique-gke"
$REPO="repoclinic"

gcloud auth login
gcloud config set project $PROJECT_ID
```

## 2) Activer APIs

```powershell
gcloud services enable container.googleapis.com artifactregistry.googleapis.com
```

## 3) Créer Artifact Registry + config docker

```powershell
gcloud artifacts repositories create $REPO `
  --repository-format=docker `
  --location=$REGION `
  --description="Clinique docker images"

gcloud auth configure-docker "$REGION-docker.pkg.dev"
```

## 4) Créer cluster GKE Autopilot + credentials kubectl

```powershell
gcloud container clusters create-auto $CLUSTER_NAME --region $REGION

gcloud container clusters get-credentials $CLUSTER_NAME --region $REGION
kubectl get nodes
```

## 5) Build & Push des images

Backend:
```powershell
docker build -t "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/clinique-backend:1.0" .\Clinique_backend
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/clinique-backend:1.0"
```

Frontend:
```powershell
docker build -t "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/clinique-frontend:1.0" .\clinique_frontend
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/clinique-frontend:1.0"
```

## 6) Déployer les manifests Kubernetes

Note: les manifests dans `k8s/` sont déjà configurés pour:
- `europe-west1-docker.pkg.dev/cliniqueproject/repoclinic/...`

Appliquer:

```powershell
kubectl apply -k .\k8s
```

Vérifier:

```powershell
kubectl get pods -n clinique
kubectl get svc -n clinique
kubectl get ingress -n clinique
```

## 7) Récupérer l'IP publique (URL jury)

Quand l'IP apparaît:

```powershell
kubectl get ingress -n clinique
```

URL jury:
- `http://<IP_INGRESS>/`

## 8) Tests rapides

```powershell
$IP="<IP_INGRESS>"
curl "http://$IP/"
curl "http://$IP/clinique/api/rendezvous"
curl "http://$IP/clinique/v3/api-docs"
```

## Dépannage (images)

### 1) `InvalidImageName`

Cause la plus fréquente: **une majuscule** dans le nom du repo ou du chemin d'image.
Ex: `.../RepoClinic/...` est invalide; Docker exige **tout en minuscules**.

Forcer immédiatement les bonnes images (sans attendre un `apply -k`):

```powershell
kubectl set image deployment/backend backend=europe-west1-docker.pkg.dev/cliniqueproject/repoclinic/clinique-backend:1.0 -n clinique
kubectl set image deployment/frontend frontend=europe-west1-docker.pkg.dev/cliniqueproject/repoclinic/clinique-frontend:1.0 -n clinique
kubectl rollout restart deployment/backend -n clinique
kubectl rollout restart deployment/frontend -n clinique
```

### 2) `ImagePullBackOff` / `ErrImagePull` avec `403 Forbidden`

Ça veut dire: le cluster **n'a pas le droit IAM** de pull depuis Artifact Registry.

Vérifier que l'image existe:

```powershell
gcloud artifacts repositories describe repoclinic --location=europe-west1
gcloud artifacts docker images list europe-west1-docker.pkg.dev/cliniqueproject/repoclinic --include-tags
gcloud artifacts docker tags list europe-west1-docker.pkg.dev/cliniqueproject/repoclinic/clinique-backend
gcloud artifacts docker tags list europe-west1-docker.pkg.dev/cliniqueproject/repoclinic/clinique-frontend
```

Donner le droit pull au Service Account des nodes:

```powershell
$PROJECT_ID="cliniqueproject"
$REGION="europe-west1"
$CLUSTER_NAME="clinique-gke"

$NODE_SA=(gcloud container clusters describe $CLUSTER_NAME --region $REGION --format="value(nodeConfig.serviceAccount)")
if (-not $NODE_SA) {
  $PROJECT_NUMBER=(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
  $NODE_SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
}

gcloud artifacts repositories add-iam-policy-binding repoclinic `
  --location=$REGION `
  --member="serviceAccount:$NODE_SA" `
  --role="roles/artifactregistry.reader"
```

Puis relancer le rollout:

```powershell
kubectl rollout restart deployment/backend -n clinique
kubectl rollout restart deployment/frontend -n clinique
kubectl rollout status deployment/backend -n clinique --timeout=180s
kubectl rollout status deployment/frontend -n clinique --timeout=180s
```

## Mise à jour (après modifications)

1) Rebuild + push une nouvelle version (ex: tag `1.1`)
2) Mettre à jour l'image dans les YAML (ou utiliser `kubectl set image`)
3) Redéployer:

```powershell
kubectl apply -k .\k8s
kubectl rollout status deployment/backend -n clinique
kubectl rollout status deployment/frontend -n clinique
```
