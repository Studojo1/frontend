# RELAUNCH (2 Nov 2026): the `web` Deployment (the new studojo.com site), made from the live `frontend` Deployment of
# the same namespace (studojo for production, staging for staging).
#
# Input: `kubectl get deployment/frontend -o json` (read only: frontend itself is never changed).
# Args:  --arg img <registry>/web:<sha>
#        --argjson drop  k8s/web/retired-env.json         names left out (the retired services)
#        --argjson set   {"NAME": "value", ...}           plain settings for web, replacing any copy
#        --argjson defaults {"NAME": "value", ...}        plain settings added only when frontend has none
# Output: a clean Deployment named web, label app=web: frontend's container settings (ports, probes, resources,
# volumes) and its env, every secret still a secretKeyRef to app-secrets.
def envlist($env):
  ($env // [])
  | map(select(.name as $n | ($drop | index($n)) == null))
  | map(select(.name as $n | ($set | has($n)) | not))
  | . as $kept
  | $kept
    + ($set | to_entries | map({ name: .key, value: .value }))
    + ($defaults | to_entries | map(select(.key as $k | ($kept | map(.name) | index($k)) == null)) | map({ name: .key, value: .value }));
{
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: { name: "web", namespace: .metadata.namespace, labels: { app: "web" } },
  spec: {
    replicas: 2,
    revisionHistoryLimit: 5,
    selector: { matchLabels: { app: "web" } },
    strategy: { type: "RollingUpdate", rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } },
    template: {
      metadata: { labels: { app: "web" } },
      spec: (
        .spec.template.spec
        | .containers = [
            .containers[]
            | select(.name == "frontend")
            | .name = "web"
            | .image = $img
            | .env = envlist(.env)
            | .lifecycle = { preStop: { sleep: { seconds: 10 } } }
          ]
        | .topologySpreadConstraints = [
            { maxSkew: 1, topologyKey: "kubernetes.io/hostname", whenUnsatisfiable: "ScheduleAnyway",
              labelSelector: { matchLabels: { app: "web" } } }
          ]
      )
    }
  }
}
