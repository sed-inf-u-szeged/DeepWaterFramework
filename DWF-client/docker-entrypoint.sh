#!/bin/bash

conda init bash
source /root/.bashrc
conda activate dwf_client
exec "$@"
