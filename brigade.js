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
    throw Error(`namespace "${namespaceName}" already exists`);
  }

  const namespace = new kubernetes.V1Namespace();
  namespace.metadata = new kubernetes.V1ObjectMeta();
  namespace.metadata.name = namespaceName;

  await k8sCoreClient.createNamespace(namespace);
};

events.on("resource_added", resource => {
  try {
    console.log(resource);
    const customer = JSON.parse(payload);
    const namespace = customer.spec.k8s-namespace;

    if (!namespace) {
      throw Error(`missing namespace`);
    }

    createNamespace(namespace).catch(error => {
      console.log(error);
    });
  } catch (error) {
    console.log(error);
  }
});

events.on("resource_modified", log);
events.on("resource_deleted", log);
events.on("resource_error", log);

function log(resource) {
  const customer = JSON.parse(resource);
  console.log(customer);
}