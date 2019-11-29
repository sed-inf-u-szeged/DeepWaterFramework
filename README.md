# Deep-Water Framework™

Copyright (c) 2019 Department of Software Engineering, University of Szeged, Hungary.

# About

Deep-Water Framework has been brought to life to make the life of researchers and practitioners easier, who experiment/work with machine learning models. The task of finding best hyper parameters, manage model results, compare and evaluate learning performances, distribute learning processes, etc. can be really cumbersome. Moreover, if you are not a super guru ninja in tweaking PyTorch, Tensorflow or alike (not to mention the option if you are not even from the field of IT), jumping into machine learning based experimentation requires a significant amount of effort and self-education. Deep-Water framework is meant to help overcome all these obstacles and let you deep-dive into machine learning based experimentation in super short time.

## Components of the Framework

* **DWF-server** - the server component that assigns learning tasks to worker machines, collects and stores the results into an elasticsearch database, and shows data visualization with the help of Kibana, a framework for displaying dashboards over elasticsearch data. 
* **DWF-client** - the worker client program, which is able to receive requests and perform various machine learning tasks. There can be an arbitrary number of worker clients connecting to the same server, so the whole learning process can be scaled by adding new workers to process tasks.
* **FeatureAssembler** - a special module that can extract features from the underlying information source (program source code most of the cases, but can be natural language texts or other), which will form the input data table for the model training. This module is designed to be easily extensible with new feature extraction algorithms.
* **DeepBugHunter** - the machine learning module that can apply many well-known machine learning algorithms to the input data to build prediction models. It wraps *sklearn* and *Tensorflow* to provide the following learning methods:
  * Naive Bayes
  * Support Vector Machine
  * K-nearest Neighbors
  * Logistic Regression
  * Linear Regression
  * Decision Tree
  * Random Forest
  * Simple Deep Neural Network
  * Custom Deep Neural Network

## How to Install

Detailed instructions on how to install and configure the server or worker clients can be found under their folders.
For a quick start, follow these steps:

### On the master node, start the DWF-server

1.  Set the SMB_VOL and SMB_DOMAIN environment variables with a Samba share configuration in the *build_and_run.bat* or *build_and_run.sh* depending on your OS in the DWF-server folder
2.  Run the *build_and_run* script you just edited from command line/terminal
3.  Enter Samba user and password when prompted
4.  When the docker stack is up and running, go to the following URL to access the DWF server web interface

        http://localhost:4000

5. Load the pre-defined dashboard description into Kibana, first go to the Kibana web application at

        http://localhost:5601/app/kibana

6. Select Management -> Saved Objects -> Import menu item and load the dashboard descriptor file located in

       DWF-server/templates/sample_dashboard.ndjson 

### On the worker node(s), start the DWF-client

5.  Edit the *config.json* file in the DWF-client/dwf_client_util folder and set the following parameters:

        "SERVER_URL" -- the URL of the DWF-server ("http://localhost:4000" by default if you run the client on the master node)
        "STORAGE_PREFIX" -- a folder on the Samba share, the paths coming from the server will be relative to this (must be the same as SMB_VOL set for the server)

6.  Install required packages using pip

         pip install -r requirements.txt
         
7.  Run the worker

        python dwf_client.py [--reinit]
        
8.  Use --reinit only if you want to get a new client ID from the server
9.  If the connection is OK, you should see the registered client on the Workers tab of the server marked in green
