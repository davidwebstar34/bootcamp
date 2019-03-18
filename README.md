
# Kubernetes Bootcamp Level 1

## Welcome to Level 1!

The objective of this bootcamp is to get familiar with some of the basic Kubernetes concepts and really get a "feel" for using Kubernetes.

If you have got some working experience with Kubernetes already, this is probably going to be too basic for you.

## High level objectives

- Build a microservice app using the language of your choice (or steal one of the existing apps provided and customize it for your needs).
- Push your microservice app to a docker registry (maybe hub.docker.com, or an AWS ECR).
- Deploy your microservice to the Kubernetes cluster and test that you can hit it internally.
- Expose your microservice to the outside world (via a service, and then an ingress) and test that you can hit it externally.
- Configure and create a DNS entry to point to your new endpoint (maybe something like mycoolapp.bootcamp.s7s.tech).

We could probably stop here, but for anyone interested in further play, we can also try the following:

- Scale up your deployment to multiple replicas (maybe 3).
- Modify your microservice code (e.g. to print out something else), and push a new version to the docker registry.
- Perform a rolling-update of your deployment, watching the new version being applied to the cluster.

---

## Installing required tools

You will need to install kubectl (the command line client for kubernetes) to access the kubernetes cluster for this bootcamp.

### Windows

Install using chocolaty

```
$ choco install kubernetes-cli
```

### Mac

```
$ brew update
$ brew install kubectl
```

---

## Getting started

- Clone this repo.
- Duplicate the "base" folder in "solutions" (maybe with your own name, e.g. "tom")
- Take a look through the application and make sure you understand it.
- Modify the code to include your own name.
- Build it using docker.

```
$ docker build .
```

- Push it to a public repository (like docker hub) - you will need to sign-up if you don't already have an account. For further details refer to https://docs.docker.com/docker-cloud/builds/push-images/

```
# from within the image directory
$ docker build -t <yourname>/<project-name>:<version> .
$ docker push <yourname>/<project-name>:<version>

# for example:
$ docker build -t tomwells/bootcamp1:1.0.0 .
$ docker push tomwells/bootcamp1:1.0.0
```

### Connect to the bootcamp cluster

- Speak to Administrator about getting your KUBECONFIG setup
- Set environment variable KUBECONFIG pointing to location of kube-config/config
- For windows users: you need to update the system/environment variables. This needs to have the full path to


```
$ kubectl cluster-info
$ kubectl get nodes
$ kubectl get pods
```

### Deploy a single pod

- Modify pod.yaml in specs/ and deploy it as a Pod to the Kubernetes cluster.

```
# To apply a yaml spec to the cluster
$ kubectl apply -f <spec>.yaml

# To delete a yaml spec from the cluster
$ kubectl delete -f <spec>.yaml
```

- Check that it launches correctly and is in Running state

```
$ kubectl get pods
```

- Hit it from inside the cluster using *kubectl port-forward* and confirm you get back the correct response. An example of this is:

```
# Port-forward from localhost:8080 to <podname>:3000
$ kubectl port-forward  pod/<podname> 8080:3000
```

- Hit it from inside the cluster using *kubectl proxy* and confirm you get back the correct response.

```
# Run the kubectl proxy first
$ kubectl proxy

# Then open the following url in your browser:
http://127.0.0.1:8001/api/v1/namespaces/default/pods/PODNAME/proxy/
```

- Now remove your pod and convert it into a Deployment (ie modify deployment.yaml) and deploy this to the cluster.

```
# Delete your pod
$ kubectl delete pod <podname>
```

### Deploy a "Deployment" (set of Pods)

- Edit the deployment.yaml file and update the file
- Deploy the deployment same way you deploy a pod:

```
# To apply a yaml spec to the cluster
$ kubectl apply -f <spec>.yaml

# To delete a yaml spec from the cluster
$ kubectl delete -f <spec>.yaml
```

- Validate that the deployment is working, and that pods are being deployed

```
# List deployments
$ kubectl get deployments

# List pods
$ kubectl get pods
```

- Again ensure you can hit the deployed pod via kubectl proxy or via port-forward using the command from above - ensure the name is correct

- Scale up the deployment (either edit the deployment.yaml or use kubectl scale deployment...)

```
$ kubectl scale --replicas 3 deployment/<deployment-name>
```

- Watch new Pods get created and deployed.

- Delete your deployment and ensure pods are removed.

### Expose Multiple Pods as a "Service"

- Modify service.yaml in specs/ and deploy an externally exposed service to the cluster.

```
# Last time I'm showing you how to do this...

# To apply a yaml spec to the cluster
$ kubectl apply -f <spec>.yaml

# To delete a yaml spec from the cluster
$ kubectl delete -f <spec>.yaml
```

- Check that the new service registers against your pod endpoints.

```
# Check what services are applied
$ kubectl get service

# Get more info about a service (e.g. endpoints registered)
$ kubectl describe service <service-name>
```

- Using kubectl proxy and port-forward, test that your service is working correctly.

```
$ kubectl port-forward service/<service-name> 8080:80
```

### Expose Service via a LoadBalancer, plus DNS entry

- Modify service.yaml and add under spec:

```
type: LoadBalancer
```

- Redeploy and watch service update with load balancer details (AWS ELB)
- You might need to wait a while for the DNS to propogate (shouldn't be too long - watch it with dig if you want).

- Hit it!

- Annotate the service with. You need to update the service.yaml file. Add the following to the meta section:

```
annotations:
  external-dns.alpha.kubernetes.io/hostname: YOURNAME.bootcamp.s7s.tech
```

- Apply the changes

```
kubectl apply -f [path to service.yaml file]
```

- Hit the servicing using the new domain name (Route53 was automatically updated)

- Revert service back to non-loadbalancer type and re-deploy.

### Expose Service via Ingress, plus DNS entry

- Modify ingress.yaml and configure for your service.
- Deploy and ensure that kubectl get ingresses registers your ingress against the ingress-controller load balancer.
- Wait for DNS to resolve, and hit it!

### Cleanup and commit
- Please ensure you cleanup all your resources (kubectl delete ...)
- Also please commit and push your code! It is great to keep all your working for reference and be able to share etc.

# End of bootcamp 1 - Well done!

# Extra points for those who can't sit still:
- Create a second microservice, and update your ingress to be able to hit both, e.g. blah.com/service1 and blah.com/service2
- Implement readiness and livelyiness probes in your services.
- Perform a blue/green deployment (update one of the microservices, and have it perform a rolling deployments with zero downtime).
- Perform a blue/green deployment, but incorporate an intentional failure and have the deployment rollback, with zero downtime.

# Some real stress testing

Tom's solution has the following modifications:
- Prints a random name for each launched container (to make it easier to identify)
- Randomly crashes

Fun to watch kubernetes really stress out if we do all the following at the same time.

1. Scale up to 30 and down to 3 every 30 seconds:
```
  while true
  do
    kubectl scale deployment tom-deployment --replicas=3
    sleep 30
    kubectl scale deployment tom-deployment --replicas=30
    sleep 30
  done
```

2. Hit the service to see we are still up and running:
```
  while true
  do
    curl http://tom.bootcamp.s7s.tech
    sleep 0
    echo
  done
```

3. Check pods starting and stopping:
```
  watch kubectl get pods
```

4. Watch logs of all pods:
```
  stern tom-deployment
```

5. Load test the service:
```
  ab -n 100000 -c 100 http://tom.bootcamp.s7s.tech/
```
---
---
---
---
---

# Administrative setup stuff...

## Setup: Creating the bootcamp cluster

Before running the bootcamp, you will need to create the kubernetes cluster and install
the various charts etc.

1. Create the cluster definition using kops

```
$ infrastructure/k8/create-cluster.sh
```

2. Edit the cluster to add IAM permissions

```
$ kops edit cluster --state=s3://kops-state-ref --name=bootcamp.s7s.tech

Then add under spec:
  additionalPolicies:
    node: |
      [
        {
          "Effect": "Allow",
          "Action": [
            "route53:ListHostedZones",
            "route53:ListResourceRecordSets"
          ],
          "Resource": [
            "*"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "route53:ChangeResourceRecordSets"
          ],
          "Resource": [
            "arn:aws:route53:::hostedzone/*"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "ec2:AttachVolume",
            "ec2:DetachVolume"
          ],
          "Resource": [
            "*"
          ]
        },
        {
          "Effect": "Allow",
          "Action": [
            "autoscaling:DescribeAutoScalingGroups",
            "autoscaling:DescribeAutoScalingInstances",
            "autoscaling:DescribeLaunchConfigurations",
            "autoscaling:DescribeTags",
            "autoscaling:SetDesiredCapacity",
            "autoscaling:TerminateInstanceInAutoScalingGroup"
          ],
          "Resource": "*"
        },
        {
           "Effect": "Allow",
            "Action": [
                "codecommit:BatchGet*",
                "codecommit:Get*",
                "codecommit:Describe*",
                "codecommit:List*",
                "codecommit:GitPull"
            ],
            "Resource": "*"
        }
      ]
```

3. Edit the node instance group to enable spot instances (for running cheap).

```
$ kops edit ig nodes --state=s3://kops-state-ref --name=bootcamp.s7s.tech

Then add under spec:
  maxPrice: "0.10"
```

4. Create the cluster.

```
$ kops update cluster --state=s3://kops-state-ref --name=bootcamp.s7s.tech --yes

... wait for cluster to come up ...

$ watch -d 'kubectl get nodes -o wide; kubectl get pods --all-namespaces'
```

5. Install ServiceAccounts, helm and charts.

```
kubectl apply -f infrastructure/k8/serviceaccounts/tiller-serviceaccount.yaml
helm init --service-account helm-tiller --upgrade --debug --wait

kubectl create namespace devops
helm upgrade --namespace devops --install nginx-ingress infrastructure/k8/charts/nginx-ingress
helm upgrade --namespace devops --install external-dns infrastructure/k8/charts/external-dns
helm upgrade --namespace devops --install metrics-server infrastructure/k8/charts/metrics-server
helm upgrade --namespace devops --install prometheus-operator infrastructure/k8/charts/prometheus-operator
helm upgrade --namespace devops --install kube-prometheus infrastructure/k8/charts/kube-prometheus
```

## Other adminitrative stuff

### Pre-requisites email

Hello Eager Kubernetes Souls!

As a reminder – this is a very much beginners bootcamp – targeted at technical folks, but first-time users of Kubernetes. You probably need to be semi-comfortable with a code editor and general command line stuff. However - if you have any prior working experience with kubernetes you may find this too basic! We are working on 3 levels of bootcamp ranging from beginner to advanced topics – so you are welcome to catch the more advanced ones in the future.

Couple of pre-requisite things:
- Please make sure you have docker installed (called Docker CE nowadays - https://docs.docker.com/install/)
- Please make sure you have kubectl installed (https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Pull the kubernetes-bootcamp-level-1 repo (https://bitbucket.org/synthesis_admin/kubernetes-bootcamp-level-1/src/master/)

Then we should be good to go!

You are of course welcome to take a look through the repo and get ahead or even complete the thing – all instructions in the README. Fire me with questions if you get stuck or need more info?

See you tomorrow!

---

Thats it!
