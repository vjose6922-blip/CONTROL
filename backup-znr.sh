#!/bin/bash
# Respaldo anual de ZNR. Correr en Cloud Shell (no necesita archivos del repo).
set -euo pipefail
P=znr-live; B=gs://znr-backups; D=$(date +%Y-%m-%d); T=$(gcloud auth print-access-token); A=https://firebaserules.googleapis.com/v1

gcloud firestore export $B/$D/firestore --project=$P                       # todas las colecciones + subcolecciones
gcloud storage rsync -r gs://$P.firebasestorage.app $B/storage/${D%%-*}    # fotos (incremental)
npx firebase-tools auth:export /tmp/auth.json --project $P && gcloud storage cp /tmp/auth.json $B/$D/ && rm /tmp/auth.json
gcloud firestore indexes composite list --project=$P --format=json | gcloud storage cp - $B/$D/indexes.json
for R in cloud.firestore firebase.storage/$P.firebasestorage.app; do      # reglas de Firestore y Storage, directo de producción
  N=$(curl -s -H "Authorization: Bearer $T" $A/projects/$P/releases/$R | jq -r .rulesetName)
  curl -s -H "Authorization: Bearer $T" $A/$N | gcloud storage cp - $B/$D/rules-${R//\//-}.json
done
