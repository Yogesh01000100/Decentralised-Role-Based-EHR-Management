# Running the test network

You can use the `./network.sh` script to stand up a simple Fabric test network. The test network has two peer organizations with one peer each and a single node raft ordering service. You can also use the `./network.sh` script to create channels and deploy chaincode. For more information, see [Using the Fabric test network](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html). The test network is being introduced in Fabric v2.0 as the long term replacement for the `first-network` sample.

If you are planning to run the test network with consensus type BFT then please pass `-bft` flag as input to the `network.sh` script when creating the channel. Note that currently this sample does not yet support the use of consensus type BFT and CA together.
That is to create a network use:
```bash
./network.sh up -bft
```

To create a channel use:

```bash
./network.sh createChannel -bft
```

To restart a running network use:

```bash
./network.sh restart -bft
```

Note that running the createChannel command will start the network, if it is not already running.

Before you can deploy the test network, you need to follow the instructions to [Install the Samples, Binaries and Docker Images](https://hyperledger-fabric.readthedocs.io/en/latest/install.html) in the Hyperledger Fabric documentation.

## Using the Peer commands

The `setOrgEnv.sh` script can be used to set up the environment variables for the organizations, this will help to be able to use the `peer` commands directly.

First, ensure that the peer binaries are on your path, and the Fabric Config path is set assuming that you're in the `test-network` directory.

```bash
 export PATH=$PATH:$(realpath ../bin)
 export FABRIC_CFG_PATH=$(realpath ../config)
```

You can then set up the environment variables for each organization. The `./setOrgEnv.sh` command is designed to be run as follows.

```bash
export $(./setOrgEnv.sh Org2 | xargs)
```

(Note bash v4 is required for the scripts.)

You will now be able to run the `peer` commands in the context of Org2. If a different command prompt, you can run the same command with Org1 instead.
The `setOrgEnv` script outputs a series of `<name>=<value>` strings. These can then be fed into the export command for your current shell.

## Chaincode-as-a-service

To learn more about how to use the improvements to the Chaincode-as-a-service please see this [tutorial](./test-network/../CHAINCODE_AS_A_SERVICE_TUTORIAL.md). It is expected that this will move to augment the tutorial in the [Hyperledger Fabric ReadTheDocs](https://hyperledger-fabric.readthedocs.io/en/release-2.4/cc_service.html)


## Podman

*Note - podman support should be considered experimental but the following has been reported to work with podman 4.1.1 on Mac. If you wish to use podman a LinuxVM is recommended.*

Fabric's `install-fabric.sh` script has been enhanced to support using `podman` to pull down images and tag them rather than docker. The images are the same, just pulled differently. Simply specify the 'podman' argument when running the `install-fabric.sh` script. 

Similarly, the `network.sh` script has been enhanced so that it can use `podman` and `podman-compose` instead of docker. Just set the environment variable `CONTAINER_CLI` to `podman` before running the `network.sh` script:

```bash
CONTAINER_CLI=podman ./network.sh up
````

As there is no Docker-Daemon when using podman, only the `./network.sh deployCCAAS` command will work. Following the Chaincode-as-a-service Tutorial above should work. 


"orderers": {
    "orderer.example.com": {
        "url": "grpc://localhost:8000",
        "tlsCACerts": {
            "pem": "-----BEGIN CERTIFICATE-----\n...certificate contents...\n-----END CERTIFICATE-----\n"
        },
        "grpcOptions": {
            "ssl-target-name-override": "orderer.example.com"
        }
    }
}

{"credentials":{"certificate":"-----BEGIN CERTIFICATE-----\nMIICkDCCAjagAwIBAgIULQzHnDuZzy5zR/RmXm4aTO0wMbcwCgYIKoZIzj0EAwIw\naDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK\nEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMt\nY2Etc2VydmVyMB4XDTI0MDMwMjE1NDkwMFoXDTI1MDMwMjE4MDkwMFowTjEwMAsG\nA1UECxMEb3JnMTANBgNVBAsTBmNsaWVudDASBgNVBAsTC2RlcGFydG1lbnQxMRow\nGAYDVQQDExFqYXZhc2NyaXB0QXBwVXNlcjBZMBMGByqGSM49AgEGCCqGSM49AwEH\nA0IABCRcNANDlTQLiCfHj2SSoYyWNpVO0ejMx9Kk0LcjBaK2ZpCnx3yuuPHBiZD0\nhnq5JnPQ06Tp7vpKq6NisSGE3pKjgdcwgdQwDgYDVR0PAQH/BAQDAgeAMAwGA1Ud\nEwEB/wQCMAAwHQYDVR0OBBYEFJHkPsmnWM4Bb7h+wqS3DNtoQ7hdMB8GA1UdIwQY\nMBaAFFo2W++VuRGiA8s0qLVFh2ginALqMHQGCCoDBAUGBwgBBGh7ImF0dHJzIjp7\nImhmLkFmZmlsaWF0aW9uIjoib3JnMS5kZXBhcnRtZW50MSIsImhmLkVucm9sbG1l\nbnRJRCI6ImphdmFzY3JpcHRBcHBVc2VyIiwiaGYuVHlwZSI6ImNsaWVudCJ9fTAK\nBggqhkjOPQQDAgNIADBFAiEAv7ZANjlWUr8wBl1hekQPiZYoe9SPvI72v5Q42UHx\nDyUCIDCp3VyiDvLHaTC2y5BFXvb8KUzLArHnl+XNRoLDjcGS\n-----END CERTIFICATE-----\n","privateKey":"-----BEGIN PRIVATE KEY-----\r\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgpijwzJNkdRo6ZsWo\r\nNU1avhGl89qpcPNRyH9QGKQIxkahRANCAAQkXDQDQ5U0C4gnx49kkqGMljaVTtHo\r\nzMfSpNC3IwWitmaQp8d8rrjxwYmQ9IZ6uSZz0NOk6e76SqujYrEhhN6S\r\n-----END PRIVATE KEY-----\r\n"},"mspId":"Org1MSP","type":"X.509","version":1}

// add the "version":1