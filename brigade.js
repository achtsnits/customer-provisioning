const { events } = require("brigadier");
const kubernetes = require("@kubernetes/client-node");

const kubeConfig = new kubernetes.KubeConfig();
kubeConfig.loadFromDefault();

const k8sCoreClient = kubeConfig.makeApiClient(kubernetes.Core_v1Api);

const createNamespace = async namespaceName => {
  const existingNamespace = await k8sCoreClient.listNamespace(
    true, "", `metadata.name=${namespaceName}`,
  );

  if (existingNamespace.body.items.length) {
    console.log(`namespace "${namespaceName}" already exists`);
    return;
  }

  const namespace = new kubernetes.V1Namespace();
  namespace.metadata = new kubernetes.V1ObjectMeta();
  namespace.metadata.name = namespaceName;

  await k8sCoreClient.createNamespace(namespace);
};

events.on("resource_added", onAdded);
events.on("resource_modified", log);
events.on("resource_deleted", log);
events.on("resource_error", log);

function onResourceAdded(e, p) {
    let customer = JSON.parse(e.payload);
    console.log("start provisioning new namespace: " + customer.spec.k8s-namespace);
    await createNamespace(customer.spec.k8s-namespace);
}

function log(e, p) {
    let obj = JSON.parse(e.payload);
    console.log(obj);
}